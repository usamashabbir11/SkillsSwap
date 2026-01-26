import loadEnvironment from "./config/environment.js";
import connectDatabase from "./config/database.js";
import app from "./app.js";

loadEnvironment();
connectDatabase();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
