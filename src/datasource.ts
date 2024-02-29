// 1) Imports
import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions } from './types';
import { SENSOR_DATA_MAPPINGS } from './constants';

import _ from 'lodash';
import { getBackendSrv, isFetchError } from '@grafana/runtime';
import { lastValueFrom } from 'rxjs';
import * as utils from "./utils";
// import defaults from 'lodash/defaults';

// 2) Functions

const convertPRTGDateTimeToISO = (date_string) => {
  // dateString = '24/01/2024 15:17:42';
  const [full_date, time] = date_string.split(' ');
  const [date, month, year] = full_date.split('/');
  const [hour, minute, second] = time.split(':');
  return `${year}-${month}-${date}T${hour}:${minute}:${second}.000Z`
};

const getRefreshTime = (cache_timeout) => {
  return Date.now() - (cache_timeout * 60000)
};

const getAverage = (duration) => {
  // duration is in milliseconds
  let avg:string = 0
  const hours = duration / 3600000;
  if (hours > 12 && hours < 36) {
    avg = '300'
  } else if (hours > 36 && hours < 745) {
    avg = '3600'
  } else if (hours > 745) {
    avg = '86400'
  }
  return avg
};

const getPRTGDate = (unixtime) => {
  const dt = new Date(unixtime);
  const str = [
    dt.getFullYear(),
    utils.pad(dt.getMonth(), true),
    utils.pad(dt.getDate()),
    utils.pad(dt.getHours()),
    utils.pad(dt.getMinutes()),
    utils.pad(dt.getSeconds())
  ];
  return str.join("-");
}

// 3) Datasource

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    
    this.base_url = instanceSettings.jsonData.path || '';
    this.cache_timeout = instanceSettings.jsonData.cache || 5;
    this.api_token = instanceSettings.jsonData.api_token || '';
    this.cache = {}
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {

    const promises = options.targets.map(async (target) => {
      let datetime = new Date().toISOString();
      let refresh_time = getRefreshTime(this.cache_timeout)
      let error_message = 'API Error: '

      if (target.chart_type === undefined) {
        return new MutableDataFrame({
          refId: target.refId,
          fields: [
            { name: 'Time', values: [datetime], type: FieldType.time },
            { name: 'Value', values: [0], type: FieldType.number },
          ],
        });
      } else if (target.chart_type === 'Time series') {
        let dates_array:string[]  = []
        let results_array:number[]  = []
        const { range } = options;
        const from = range!.from.valueOf();
        const to = range!.to.valueOf();
        const duration = to - from;
        let avg = getAverage(duration)
        let start_date = '&sdate=' + getPRTGDate(from)
        let end_date = '&edate=' + getPRTGDate(to)

        const params = `id=${target.sensor_id}&avg=${avg}${start_date}${end_date}&usecaption=true`
        const cache_key = `historicdata.json&id=${target.sensor_id}&avg=${avg}&${target.channel_name}`

        if (this.cache[cache_key] && refresh_time < this.cache[cache_key].timestamp) {
          dates_array = this.cache[cache_key]['dates_array']
          results_array = this.cache[cache_key]['results_array']
        } else {
          const response = await this.request('historicdata.json', params);

          if ((response.data.histdata).length > 0) {
            let channel_name = target.channel_name
            if (channel_name.includes('Traffic')) {
              channel_name = channel_name + ' (Speed)'
            }
            response.data.histdata.forEach(function(x:any) {
              if (parseFloat(x[channel_name]) > 0) {
                results_array.push(x[channel_name]);
                dates_array.push(convertPRTGDateTimeToISO(x.datetime));
              }
            })
          }
          this.cache[cache_key] = {'results_array': results_array, 'dates_array': dates_array, 'timestamp': Date.now()}
        }

        return new MutableDataFrame({
          refId: target.refId,
          fields: [
            { name: 'Time', values: dates_array, type: FieldType.time },
            { name: target.channel_name, values: results_array, type: FieldType.number },
          ],
        });
      } else if (target.chart_type === 'Stat' && target.query_mode === 'Text')  {
        const params = `id=${target.sensor_id}`
        const cache_key = params + `?filter_property=${target.filter_property}`
        let last_value = 'N/a'

        if (this.cache[cache_key] && refresh_time < this.cache[cache_key].timestamp) {
          last_value = this.cache[cache_key]['last_value']
          datetime = this.cache[cache_key]['datetime']
        } else {
          const response = await this.request('getsensordetails.json', params);
          last_value = response.data.sensordata[SENSOR_DATA_MAPPINGS[target.filter_property]]
          this.cache[cache_key] = {'last_value': last_value, 'datetime': datetime, 'timestamp': Date.now()}
        }

        return new MutableDataFrame({
          refId: target.refId,
          fields: [
            { name: 'Time', values: [datetime], type: FieldType.time },
            { name: 'Message', values: [last_value], type: FieldType.string },
          ],
        });
      } else {
        let converted_value = 'NaN'
        const params = `content=channels&columns=name,datetime,lastvalue_&id=${target.sensor_id}`
        const cache_key = params + `?channel=${target.channel_name}`

        // In cache && within timeout. 
        if (this.cache[cache_key] && refresh_time < this.cache[cache_key].timestamp) {
          converted_value = this.cache[cache_key]['converted_value']
          datetime = this.cache[cache_key]['datetime']
        } else {
          try {
            const response = await this.request('table.json', params);
            if ((response.data.channels).length > 0) {
              const channel = response.data.channels.find(ob=>(ob.name === target.channel_name))
              converted_value = channel.lastvalue_raw
              datetime = convertPRTGDateTimeToISO(channel.datetime)
              this.cache[cache_key] = {'converted_value': converted_value, 'datetime': datetime, 'timestamp': Date.now()}
            }
          } catch {
            if (this.cache[cache_key]) {
              converted_value = this.cache[cache_key]['converted_value']
              datetime = this.cache[cache_key]['datetime']
              error_message = error_message + `Using cached values: ${converted_value}`
            } else {
              error_message = error_message + 'No cached value, please refresh.'
            }
            console.log(error_message)
          }
        }  
        return new MutableDataFrame({
          refId: target.refId,
          fields: [
            { name: 'Time', values: [datetime], type: FieldType.time },
            { name: target.channel_name, values: [converted_value], type: FieldType.number },
          ],
        });
      }

    });

    return Promise.all(promises).then((data) => ({ data }));

  }

  async request(route_path: string, params?: string) {
    const response = getBackendSrv().fetch<DataQueryResponse>({
      url: `${this.base_url}${route_path}${params?.length ? `?${params}` : '?'}&apitoken=${this.api_token}`,
    });
    return lastValueFrom(response);
  }

  async testDatasource() {
    // Implement a health check for your data source.
    const default_error = 'Cannot connect to API';

    try {
      const response = await this.request('status.json', '');
      if (response.status === 200) {
        return {
          status: 'success',
          message: 'Success. Version: ' + response.data.Version + ' returned from PTRG.',
        };
      } else {
        return {
          status: 'error',
          message: response.statusText ? response.statusText : default_error,
        };
      }
    } catch (err) {
      let message = '';
      if (_.isString(err)) {
        message = err;
      } else if (isFetchError(err)) {
        message = 'Fetch error: ' + (err.statusText ? err.statusText : default_error);
        if (err.data && err.data.error && err.data.error.code) {
          message += ': ' + err.data.error.code + '. ' + err.data.error.message;
        }
      }
      return {
        status: 'error',
        message,
      };
    }
  }
}
