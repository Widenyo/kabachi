const fs = require("fs");
const { Subject } = require("rxjs");
const chalk = require("chalk");
class Logger extends Subject {

  constructor(path) {
    fs.writeFileSync(path, "")
    super()
    this.path = path
  }

  error(title, content) {
    this.next({
      title,
      content,
      type: "ERROR",
      date: new Date(),
    });

    console.log(`${chalk.bgRed.black(title)}: ${chalk.red(content)}`);
  }

  message(title, content, color) {
    this.next({
      title,
      content,
      type: "MESSAGE",
      date: new Date(),
    });

    switch (color) {
      case "green":
        console.log(`${chalk.bgGreen.black(title)}: ${chalk.green(content)}`);
        break;
      case "cyan":
        console.log(
          `${chalk.bgCyanBright.black(title)}: ${chalk.cyan(content)}`
        );
        break;
      default:
        break;
    }
  }

  logJson(title, content) {
    this.next({
      title,
      content: JSON.stringify(content, null, 2),
      type: "JSON",
      date: new Date(),
    });
  }

  write() {
    this.subscribe(({ date, type, title, content }) => {
      fs.appendFileSync(
        this.path,
`${date.getDay().toString().padStart(2, "0")}/${date
          .getMonth().toString()
          .padStart(2, "0")}/${date.getFullYear()} ${date
          .getHours().toString()
          .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}
BACKEND.${type}:
  ${title} "${content}"

`
      );
    });
  }
}

module.exports = Logger;
