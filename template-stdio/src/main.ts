import {Command} from "commander" 
import { MyServer } from "./server.js";


const program = new Command()
  .name("my-mcp")
  .version("1.0.0")
  .description("A Demo CLI tool")


// 注册子命令：run-server
program.command("run-server")
  .description("Run the server")
  .action((options) => {
    // 和mcp client "握手"通信，你必须运行如下代码
    const server = new MyServer();
    server.init();
    server.run();
  })

// 解析命令行参数
program.parse(process.argv)