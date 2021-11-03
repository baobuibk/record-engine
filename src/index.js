const PORT = process.env.PORT || 3000;
const expressServer = require("./server");

async function main() {
  expressServer.listen(PORT, () => {
    console.log("server is listening on port", PORT);
  });
}

main().catch(async (error) => {
  console.log(error);
  process.exit(1);
});
