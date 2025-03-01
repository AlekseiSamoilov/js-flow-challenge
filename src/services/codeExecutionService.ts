import { IExecutionResult } from "../types";

export const executeCodeWithWorker = (code: string): Promise<IExecutionResult> => {
    return new Promise((resolve) => {

        const workerBlob = new Blob([`
            self.onmessage = function(e) {
              const logs = [];
              // Перехватываем console.log
              self.console = {
                ...self.console,
                log: function(...args) {
                  logs.push(args.map(arg => {
                    if (arg === undefined) return 'undefined';
                    if (arg === null) return 'null';
                    if (typeof arg === 'object') {
                      try {
                        return JSON.stringify(arg);
                      } catch (e) {
                        return String(arg);
                      }
                    }
                    return String(arg);
                  }).join(' '));
                },
                warn: function(...args) {
                  logs.push('[WARN] ' + args.join(' '));
                },
                error: function(...args) {
                  logs.push('[ERROR] ' + args.join(' '));
                }
              };
              
              try {
                // Оборачиваем код в асинхронную функцию для поддержки асинхронных операций
                eval('(async () => { try { ' + e.data + ' } catch (e) { console.error(e.message); } })()');
                
                // Даем время на выполнение асинхронного кода
                setTimeout(() => {
                  self.postMessage({ success: true, logs });
                }, 100);
              } catch (error) {
                self.postMessage({ 
                  success: false, 
                  error: error.message,
                  logs 
                });
              }
            };
          `], { type: 'application/javascript' });
    });
};

export const executeCodeInMainThread = (code: string): Promise<IExecutionResult> => {
    return new Promise((resolve) => {
        const logs: string[] = [];
        const originalConsoleLog = console.log;
        const originalConsoleWarn = console.warn;
        const originalConsoleError = console.error;

        console.log = (...args) => {
            logs.push(args.map(arg => {
                if (typeof arg === 'object' && arg !== null) {
                    try {
                        return JSON.stringify(arg);
                    } catch {
                        return String(arg);
                    }
                }
                return String(arg)
            }).join(' '));
        };

        console.warn = (...args) => {
            logs.push(`[WARN] ` + args.join(' '));
        };

        console.error = (...args) => {
            logs.push(`[ERROR]` + args.join(' '));
        };

        try {
            const wrappedCode = `
            (async function() {
              try {
                ${code}
              } catch (error) {
                console.error(error.message);
              }
              
              // Восстанавливаем оригинальные функции console и возвращаем логи
              setTimeout(() => {
                console.log = originalConsoleLog;
                console.warn = originalConsoleWarn;
                console.error = originalConsoleError;
                resolve({ success: true, logs });
              }, 100);
            })();
          `;

            eval(wrappedCode);
        } catch (error) {
            logs.push(`[ERROR] ${(error as Error).message}`);
            console.log = originalConsoleLog;
            console.warn = originalConsoleWarn;
            console.error = originalConsoleError;
            resolve({
                success: false,
                error: (error as Error).message,
                logs
            });
        }
    });
};

export const executeCode = async (code: string): Promise<IExecutionResult> => {
    try {
        return await executeCodeWithWorker(code);
    } catch (error) {
        console.warn('Web Worker execution failed, falling back to main thread:', error);
        return executeCodeInMainThread(code);
    }
};