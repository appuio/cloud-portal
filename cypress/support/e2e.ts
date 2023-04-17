import './commands';
import * as installLogsCollector from 'cypress-terminal-report/src/installLogsCollector';

installLogsCollector({
  collectTypes: ['cons:log', 'cons:info', 'cons:warn', 'cons:error', 'cy:log', 'cy:command'],
});
