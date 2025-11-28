
/*
  程序入口
*/
import { MyServer } from "./server.js";
const server = new MyServer();
server.init();
server.run();