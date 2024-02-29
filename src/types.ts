import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  // queryText?: string;
  chart_type: string;
  query_mode?: string;
  group_name?: string;
  device_name?: string;
  sensor_id?: number;
  channel_name?: string;
  filter_property?: string;
}

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  path?: string;
  cache?: number;
  api_token?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
// export interface MySecureJsonData {
//   apiKey?: string;
// }

// export const defaultQuery: Partial<MyQuery> = {
//   constant: 6.5,
//   frequency: 1.0,
// };
