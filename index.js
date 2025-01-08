const express = require("express");
var serveIndex = require("serve-index");
const app = express();
const port = 3100;

app.use(
  "/ftp",
  express.static("uploads"),
  serveIndex("uploads", { icons: true, view: "details" })
);

app.use("/accounts", require("./routes/accounts"));
app.use("/monitoring", require("./routes/monitoring"));
app.use("/pdf", require("./routes/print"));
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
