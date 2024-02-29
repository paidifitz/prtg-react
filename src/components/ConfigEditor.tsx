import React, { ChangeEvent, useState } from 'react';
import { InlineField, Input, SecretInput } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions, MySecureJsonData } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  const [cache, setCache] = useState(options.jsonData.cache || '')
  const [error, setError] = useState('')

  const onPathChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      path: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  const onCacheChange = (event: ChangeEvent<HTMLInputElement>) => {
    const cache_timeout = parseInt(event.target.value, 10);
    
    if (cache_timeout > 0 && cache_timeout <= 1440) {
      const jsonData = {
        ...options.jsonData,
        cache: cache_timeout,
      };
      setCache(cache_timeout)
      setError('')
      onOptionsChange({ ...options, jsonData });
    } else {
      const jsonData = {
        ...options.jsonData,
        cache: 5
      };
      setCache('')
      onOptionsChange({ ...options, jsonData });
      setError('Cache timeout should be a number between 1 and 1440. It will default to 5 if not set.')
    }
  };

  const onApiTokenChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      api_token: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  // Secure field (only sent to the backend)
  // const onAPIKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   onOptionsChange({
  //     ...options,
  //     secureJsonData: {
  //       apiKey: event.target.value,
  //     },
  //   });
  // };

  // const onResetAPIKey = () => {
  //   onOptionsChange({
  //     ...options,
  //     secureJsonFields: {
  //       ...options.secureJsonFields,
  //       apiKey: false,
  //     },
  //     secureJsonData: {
  //       ...options.secureJsonData,
  //       apiKey: '',
  //     },
  //   });
  // };

  const styles = {
    error: {
      paddingLeft: '165px',
      paddingTop: '8px',
      fontSize: '10px', 
      color: 'red'
    },
  };

  const { jsonData, secureJsonFields } = options;
  // const secureJsonData = (options.secureJsonData || {}) as MySecureJsonData;

  return (
    <div className="gf-form-group">
      <InlineField label="Path" labelWidth={20}>
        <Input
          onChange={onPathChange}
          value={jsonData.path || ''}
          placeholder="json field returned to frontend"
          width={40}
        />
      </InlineField>
{/*      <InlineField label="API Key" labelWidth={20}>
        <SecretInput
          isConfigured={(secureJsonFields && secureJsonFields.apiKey) as boolean}
          value={secureJsonData.apiKey || ''}
          placeholder="secure json field (backend only)"
          width={40}
          onReset={onResetAPIKey}
          onChange={onAPIKeyChange}
        />
      </InlineField>*/}
      <InlineField label="API Token" labelWidth={20}>
        <SecretInput
          value={jsonData.api_token || ''}
          placeholder="api token"
          width={40}
          onChange={onApiTokenChange}
        />
      </InlineField>
      <InlineField label="Cache timeout" labelWidth={20}>
        <Input
          onKeyPress={e => { e.key === 'Enter' && e.preventDefault(); }}
          onChange={onCacheChange}
          value={cache}
          placeholder="Timeout in minutes"
          width={40}
        />
      </InlineField>
      <div>
        <p style={styles.error} id="age-error">{error}</p>
      </div>
    </div>
  );
}
