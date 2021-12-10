import { Component } from "./base-component.js";
import { autobind } from "../decorator/autobind.js";
import { Validatable, validate } from "../util/validation.js";
import { projectState } from "../state/project-state.js";
/**
 * Class ProjectInput: Main class of the project
 */
export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInput: HTMLInputElement;
  /**
   * The constructor for ProjectInput and will be used to get all the information of the page
   * not sure this is the best way, but this is what is said in the course
   */
  constructor() {
    super("project-input", "app", true, "user-input");

    this.titleInputElement = this.element.querySelector(
      "#title"
    )! as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    )! as HTMLInputElement;
    this.peopleInput = this.element.querySelector(
      "#people"
    )! as HTMLInputElement;

    this.configure();
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    //typles are in fact just arrays
    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;
      console.log(title, description, people);
      projectState.addProject(title, description, people);
      this.clearInput();
    }
  }

  renderContent() {}
  /**
   * Old method to get the binding of an element
   */
  configure() {
    //this is a correct solution but a better solution is to use decorators
    this.element.addEventListener("submit", this.submitHandler);
  }

  /**
   * returns a tuple
   */
  @autobind
  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInput.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };

    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minlength: 10,
    };

    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
    };
    if (
      !(
        validate(titleValidatable) &&
        validate(descriptionValidatable) &&
        validate(peopleValidatable)
      )
    ) {
      alert("Error Validation");
      return;
    }
    return [enteredTitle, enteredDescription, +enteredPeople];
  }

  /**
   * Resetting the fields of the page
   */
  private clearInput(): void {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInput.value = "";
  }
}
