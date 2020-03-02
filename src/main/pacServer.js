import * as http from 'http';
import * as fs from 'fs';
import { PAC_PATH } from './const';
import { setupSystemProxy } from './utils';

export class PacServer {
	server = null;
	startup() {
		this.server = http
			.createServer((req, res) => {
				let pac = fs.readFileSync(PAC_PATH, {
					encoding: 'utf8'
				});
				res.statusCode = 200;
				res.setHeader('Content-Type', 'text/plain');
				res.end(pac);
			})
			.listen(8989);

		setupSystemProxy('on');
	}
	shutdown() {
		this.server && this.server.close() && (this.server = null);
		setupSystemProxy('off');
	}
}
