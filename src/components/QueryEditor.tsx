import React, { ChangeEvent, useState, useEffect, useRef } from 'react';
import { InlineField, Input } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery } from '../types';
import Switch from '@mui/joy/Switch';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

// Query mode
const queryModeOptions = ['Metrics', 'Text', 'Raw']

// These are the bare minimum options for allowing a sensor message to be displayed. To be expanded in future.
// const filterProperties = ['', 'Tags', 'Active', 'Status', 'Status (Raw)', 'Message', 'Priority']
const filterProperties = ['Message', 'Status', 'Status (Raw)']
// const valueFromOptions = ['Group', 'Device', 'Sensor']
const valueFromOptions = ['Sensor']

export function QueryEditor({ query, datasource, onChange, onRunQuery }: Props) {

  const base_url = datasource.base_url
  const api_token = "&apitoken=" + datasource.api_token

  const [queryMode, setQueryMode] = useState(query.query_mode || queryModeOptions[0])
  
  const [group, setGroup] = useState(query.group_name || '*')
  const [device, setDevice] = useState(query.device_name || '*')
  const [sensor, setSensor] = useState(query.sensor_id || 0)
  const [channel, setChannel] = useState(query.channel_name || '*')

  const [filterProperty, setFilterProperty] = useState(query.filter_property || filterProperties[0])
  const [valueFrom, setValueFrom] = useState(valueFromOptions[0])
  // const [sensorName, setSensorName] = useState(false)
  // const [deviceName, setDeviceName] = useState(false)
  // const [channelFiler, setChannelFiler] = useState(false)

  let visSelector = (document.querySelector('[aria-label="Change Visualization"]') as HTMLInputElement | null);
  let visualization = visSelector.children[1].innerHTML

  const styles = {
    switch: {
      paddingLeft: '20px',
      paddingRight: '30px',
    },
    fillPadding: {
      marginLeft: '15px',
    },
    calcButton: {
      padding: '0px 15px',
      margin: '0px 15px 4px 15px',
      borderRadius: '7px',
      color: '#FFF',
      border: 'none',
      backgroundColor: '#3781DC',
    }
  };

  const [groupList, setGroupList] = useState(['']);
  const [groupLoading, setGroupLoading] = useState(true);

  useEffect(() => {
    fetch(base_url + 'table.json?content=groups&count=9999&columns=objid,group,probe,tags,active,status,message,priority' + api_token)
      .then(response => response.json())
      .then((data) => {
        if (data.treesize > 0) {
          let uniqueGroups = Array.from(new Set(data.groups.map((x) => x.group).sort()))
          uniqueGroups.unshift('*')
          setGroupList(uniqueGroups);
        } else {
          console.log('No Groups.')
        }
        setGroupLoading(false);
      })
      .catch((e) => {
        console.error(`An error occurred: ${e}`)
      });
  }, []);

  const [deviceList, setDeviceList] = useState(['']);
  const [deviceLoading, setDeviceLoading] = useState(true);

  useEffect(() => {
    let device_url = base_url + "table.json?content=devices&count=9999&columns=objid,device,group,probe,tags,active,status,message,priority" + api_token
    if (group !== '*') {
      device_url += '&filter_group=' + group
    }

    fetch(device_url)
      .then(response => response.json())
      .then((data) => {
        if (data.treesize > 0) {
          let uniqueDevices = Array.from(new Set(data.devices.map((x) => x.device).sort()))
          uniqueDevices.unshift('*')
          setDeviceList(uniqueDevices);
        } else if (group !== '*') {
          setDeviceList(['*']);
          console.log('No devices for that group.')
        } else {
          console.log('No Devices.')
        }
        setDeviceLoading(false);
      })
      .catch((e) => {
        console.error(`An error occurred: ${e}`)
      });
  }, [group]);

  const [sensorList, setSensorList] = useState(['']);
  const [sensorLoading, setSensorLoading] = useState(true);

  useEffect(() => {
    let sensor_url = base_url + "table.json?content=sensors&count=9999&columns=objid,sensor,device,group,probe,tags,active,status,message,priority" + api_token
    if (device !== '*') {
      sensor_url += '&filter_device=' + device
    }

    fetch(sensor_url)
      .then(response => response.json())
      .then((data) => {
        if (data.treesize > 0) {
          let sensorHash = []
          data.sensors.forEach(function(x:any) {
            let singleObj: any = {};
            singleObj['id'] = x.objid;
            singleObj['name'] = x.sensor;
            sensorHash.push(singleObj);
          });
          sensorHash.unshift({ id: 0, name: '*'})
          setSensorList(sensorHash);
        } else if (device !== '*') {
          setSensorList([{ id: 0, name: '*'}]);
          console.log('No sensors for that device.')
        } else {
          console.log('No Sensors.')
        }
        setSensorLoading(false);
      })
      .catch((e) => {
        console.error(`An error occurred: ${e}`)
      });
  }, [device]);

  const onSensorChange = (event: ChangeEvent<HTMLInputElement>) => {
    let sensorId = event.target.value
    setSensor(sensorId)
    if ( queryMode === 'Text' && visualization == 'Stat') {
      getSensorDetail(sensorId, filterProperty)
    } else {
      console.log('No sensor details required.')
    }
  };

  const [channelList, setChannelList] = useState(['']);
  const [channelLoading, setChannelLoading] = useState(true);

  useEffect(() => {
    let channel_url = base_url + "table.json?content=channels&output=json&columns=name,datetime,lastvalue_&id=" 
    if (sensor !== 0) {
      channel_url += sensor + "&noraw=1&usecaption=true" + api_token
    } else {
      channel_url += "0&noraw=1&usecaption=true" + api_token
    }

    fetch(channel_url)
      .then(response => response.json())
      .then((data) => {
        if ((data.channels).length > 0) {
          let channelHash = []
          data.channels.forEach(function(x:any) {
            let singleObj: any = {};
            singleObj['name'] = x.name;
            singleObj['last_value'] = x.lastvalue;
            channelHash.push(singleObj);
          });
          channelHash.unshift({ name: '*'})
          setChannelList(channelHash);
        } else if (sensor !== 0) {
          setChannelList([{ name: '*'}]);
          console.log('No channels for that sensor.')
        } else {
          console.log('No Channels.')
        }
        setChannelLoading(false);
      })
      .catch((e) => {
        console.error(`An error occurred: ${e}`)
      });
  }, [sensor]);

  const onChannelChange = (event: ChangeEvent<HTMLInputElement>) => {
    let channelName = event.target.value
    setChannel(channelName)

    onChange({ ...query, query_mode: queryMode, chart_type: visualization, group_name: group, device_name: device, sensor_id: parseInt(sensor), 
                  channel_name: channelName });
    onRunQuery();
  };

  const onFilterPropertyChange = (event: ChangeEvent<HTMLInputElement>) => {
    let filterProp = event.target.value 
    setFilterProperty(filterProp)

    if ( queryMode === 'Text' && visualization == 'Stat' && sensor !== 0) {
      getSensorDetail(sensor, filterProp)
    } else {
      console.log('No Get call for sensor')
    }
  };

  let refreshButton = (document.querySelector('[aria-label="Refresh dashboard"]') as HTMLInputElement | null);
  
  refreshButton.addEventListener("click", (event) => {
    onChange({ ...query, query_mode: queryMode, chart_type: visualization, group_name: group, device_name: device, sensor_id: parseInt(sensor), 
                  channel_name: channel });
    onRunQuery();
  });

  function getSensorDetail(sensor, filterProperty) {
    onChange({ ...query, query_mode: queryMode, chart_type: visualization, group_name: group, device_name: device, sensor_id: sensor, 
                      channel_name: '*', filter_property: filterProperty });
    onRunQuery();
  }

  return (
    <div>
      <div className='gf-form-inline'>
        <div className="gf-form max-width-20">
          <div className="gf-form-label width-7">Query Mode</div>
          { ( true ) ?
              <select value={queryMode} onChange={(event) => setQueryMode(event.target.value)} className='gf-form-select-wrapper max-width-20' type="string">
                <option value='Metrics' className="gf-form-input" >Metrics</option>
                <option value='Text' className="gf-form-input" >Text</option>
                <option value='Raw' className="gf-form-input" disabled='true' >Raw</option>
              </select>
            :
            <select value={queryMode} onChange={(event) => setQueryMode(event.target.value)} className='gf-form-select-wrapper max-width-20' type="string">
              {queryModeOptions.map((queryModeoption) => (
                <option value={queryModeoption} className="gf-form-input">{queryModeoption}</option>
              ))}
            </select>
          }
        </div>          
        <div className="gf-form gf-form--grow" style={styles.fillPadding}>
          <div className="gf-form-label gf-form-label--grow"></div>
        </div>
      </div>
      { queryMode !== 'Raw' ?
        <div className='gf-form-inline'>
          <div className="gf-form max-width-20">
            <div htmlLabel="Group" className="gf-form-label query-keyword width-7">Group</div>
            { groupLoading ? 
              <Input type='text' disabled={true} placeholder=' Loading groups...' /> :
              /* <Input value={group} onChange={(event) => setGroup(event.target.value)} className='gf-form-select-wrapper max-width-20' type="text">
              </Input>*/
              <select value={group} onChange={(event) => setGroup(event.target.value)} className='gf-form-select-wrapper max-width-20' type="string">
                {groupList.map((groupOption) => (
                  <option value={groupOption} className="gf-form-input">{groupOption}</option>
                ))}
              </select>
            }
          </div>
          <div className="gf-form max-width-20">
            <div htmlLabel="Host" className="gf-form-label query-keyword width-7" style={styles.fillPadding}>Host</div>
            { deviceLoading ? 
              <Input type='text' disabled={true} placeholder=' Loading hosts...' /> :
              /*<Input value={host} onChange={(event) => setHost(event.target.value)} className='gf-form-select-wrapper max-width-20' type="text">
              </Input> */
              <select value={device} onChange={(event) => setDevice(event.target.value)} className='gf-form-select-wrapper max-width-20' type="string">
                {deviceList.map((deviceOption) => (
                  <option value={deviceOption} className="gf-form-input">{deviceOption}</option>
                ))}
              </select>
            }
          </div>
        </div>
        :
        <div className='gf-form-inline'>
          <div className="gf-form max-width-30">
            <div className="gf-form-label query-keyword width-7">URI</div>
            {/* <Input placeholder="getstatus.htm" className='gf-form-select-wrapper max-width-25' type="text"></Input>*/}
            <Input type='text' disabled={true} placeholder='To be developed...' className='gf-form-wrapper max-width-25'/>
          </div>
          <div className="gf-form max-width-30">
            <div className="gf-form-label query-keyword width-10">Query String</div>
            {/* <Input placeholder="id=0&tabid=1" className='gf-form-select-wrapper max-width-30' type="text"></Input>*/}
            <Input type='text' disabled={true} placeholder='To be developed...' className='gf-form-wrapper max-width-25'/>

          </div>
          <div className="gf-form gf-form--grow">
            <div className="gf-form-label gf-form-label--grow"></div>
          </div>
        </div>
      }

      { queryMode !== 'Raw' ?
        <div className='gf-form-inline'>
          <div className="gf-form max-width-30">
            <div htmlLabel="Sensor" className="gf-form-label query-keyword width-7">Sensor</div>
            { sensorLoading ? 
              <Input type='text' disabled={true} placeholder=' Loading sensors...' /> :
              /*<Input value={sensor} onChange={(event) => setSensor(event.target.value)} className='gf-form-select-wrapper max-width-20' type="text">
              </Input>*/
              <select value={sensor} onChange={onSensorChange} className='gf-form-select-wrapper max-width-30 sensorValue' type="string">
                {sensorList.map((sensorOption) => (
                  <option value={sensorOption.id} className="gf-form-input">{sensorOption.name}</option>
                ))}
              </select>
            }
          </div>
          { queryMode !== 'Text' ? 
            <div className="gf-form max-width-30">
              <div htmlLabel="Channel" className="gf-form-label query-keyword width-7" style={styles.fillPadding}>Channel</div>
              { sensor !== 0 ? 
                //   <Input value={channel} onChange={(event) => setChannel(event.target.value)} className='gf-form-select-wrapper max-width-20' type="text">
                //   </Input>
                <select value={channel} onChange={onChannelChange} className='gf-form-select-wrapper max-width-30' type="string">
                  {channelList.map((channelOption) => (
                    <option value={channelOption.name} className="gf-form-input">{channelOption.name}</option>
                  ))}
                </select> 
                :
                <Input type='text' disabled={true} 
                  placeholder={ channelLoading ? ' Loading channels...' : ' Sensor must be selected first.' }
                />
              }
            </div>
            : ''
          }
          {/*<InlineField label="Query Text" labelWidth={16} tooltip="Not used yet">
            <Input onChange={onQueryTextChange} value={queryText || ''} />
          </InlineField>

          <InlineField label="Frequency" labelWidth={16}>
            <Input onChange={onFrequencyChange} value={constant || ''} />
          </InlineField>*/}
        </div>
        : ''
      }

      { queryMode === 'Text' ?
        // This is an unnecessary if statement once more options are added.
        <div className='gf-form-inline'>
          <div className="gf-form max-width-40">
            <div className="gf-form-label query-keyword width-7">Options</div>
          </div>
          { queryMode === 'Text' ?
            <div className="gf-form max-width-20">
              <div className="gf-form-label width-10">Value From</div>
                <select value={valueFrom} onChange={(event) => setValueFrom(event.target.value)} className='gf-form-select-wrapper '>
                  {valueFromOptions.map((valueFromOption) => (
                    <option value={valueFromOption} className="gf-form-input">{valueFromOption}</option>
                  ))}
                </select>
            </div>
            : ''
          }
          { queryMode === 'Text' ? 
            // Change to queryMode !== 'Raw' when further development of options is being done.
            <div className="gf-form max-width-20">
              <div className="gf-form-label width-10">Filter Property</div>
                <select value={filterProperty} onChange={onFilterPropertyChange} className='gf-form-select-wrapper '>
                  {filterProperties.map((filterPropertyOption) => (
                    <option value={filterPropertyOption} className="gf-form-input">{filterPropertyOption}</option>
                  ))}
                </select>
            </div>
            : ''
          }
  {/*        { queryMode === 'Text' ?
            <div className="gf-form gf-form--grow">
              <div className="gf-form-label gf-form-label--grow"></div>
            </div>
            :''
          }
          <div className="gf-form max-width-30">
            <div className="gf-form-label width-10">Text Filter</div>
            <Input placeholder="Text filter (regex)" className='gf-form-select-wrapper max-width-20' type="text">
            </Input>
          </div>
          <div className="gf-form gf-form--grow">
            <div className="gf-form-label gf-form-label--grow"></div>
          </div>*/}
        </div>
        : ''
      }
{/*      { queryMode === 'Metrics' ?
        <div className='gf-form-inline'>
          <div className="gf-form max-width-40">
            <div className="gf-form-label query-keyword width-7"></div>
          </div>
          <div className="gf-form max-width-16">
            <div className="gf-form-label width-10">Include Sensor Name</div>
            <Switch style={styles.switch} checked={sensorName} onChange={(event) => setSensorName(sensorName => !sensorName)} 
            sx={{"--Switch-trackWidth": "50px"}}/>
          </div>
          <div className="gf-form max-width-16">
            <div className="gf-form-label width-10">Include Device Name</div>
            <Switch style={styles.switch} checked={deviceName} onChange={(event) => setDeviceName(deviceName => !deviceName)}
            sx={{"--Switch-trackWidth": "50px"}}/>
          </div>
          <div className="gf-form max-width-16">
            <div className="gf-form-label width-10">Invert Channel Filter</div>
            <Switch style={styles.switch} checked={channelFiler} onChange={(event) => setChannelFiler(channelFiler => !channelFiler)}
            sx={{"--Switch-trackWidth": "50px"}}/>
          </div>
        </div>
        : ''
      }*/}
    </div>
  );
}
