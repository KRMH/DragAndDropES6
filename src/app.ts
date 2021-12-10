/**
 * Create the instance of the class to get everything working
 * since all the code is in the constructor
 */
import { ProjectInput } from "./components/project-input.js";
import { ProjectList } from "./components/project-list.js";

new ProjectInput();
new ProjectList("active");
new ProjectList("finished");
