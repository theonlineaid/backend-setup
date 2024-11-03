
import http from 'http';

export const getPublicIp = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        http.get('http://api.ipify.org/', (resp) => {
            let ip = '';

            resp.on('data', (chunk) => {
                ip += chunk;
            });

            resp.on('end', () => {
                resolve(ip);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
};
