"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
//Project Type
var App;
(function (App) {
    let ProjectStatus;
    (function (ProjectStatus) {
        ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
        ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
    })(ProjectStatus = App.ProjectStatus || (App.ProjectStatus = {}));
    class Project {
        constructor(id, title, description, people, status) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.people = people;
            this.status = status;
        }
    }
    App.Project = Project;
})(App || (App = {}));
/// <reference path="drag-drop-interfaces.ts"/>
/// <reference path="project-model.ts"/>
var App;
(function (App) {
    /**
     * Project State Management
     */
    class ProjectState {
        constructor() {
            this.listeners = [];
            this.projects = [];
        }
        static getInstance() {
            if (this.instance != null) {
                return this.instance;
            }
            this.instance = new ProjectState();
            return this.instance;
        }
        addListener(listenerFn) {
            this.listeners.push(listenerFn);
        }
        addProject(title, description, numOfPeople) {
            const newProject = new App.Project(Math.random().toString(), title, description, numOfPeople, App.ProjectStatus.Active);
            this.projects.push(newProject);
            this.updateListeners();
        }
        moveProject(projectId, newStatus) {
            const project = this.projects.find((prj) => prj.id === projectId);
            if (project && project.status !== newStatus) {
                project.status = newStatus;
                this.updateListeners();
            }
        }
        updateListeners() {
            for (const listenerFn of this.listeners) {
                listenerFn(this.projects.slice());
            }
        }
    }
    const projectState = ProjectState.getInstance();
    /**
     * This function will verify the value of all the fields in the page (if needed)
     * @param validatableInput
     * @returns
     */
    function validate(validatableInput) {
        let isValid = true;
        //required check
        if (validatableInput.required) {
            isValid =
                validatableInput.value.toString().trim().length === 0 ? false : true;
            if (!isValid) {
                return false;
            }
        }
        //minLength check
        if (validatableInput.minlength != null) {
            isValid =
                validatableInput.value.toString().trim().length >=
                    validatableInput.minlength;
            if (!isValid) {
                return false;
            }
        }
        //maxLength check
        if (validatableInput.maxlength != null) {
            isValid =
                validatableInput.value.toString().trim().length <=
                    validatableInput.maxlength;
            if (!isValid) {
                return false;
            }
        }
        return isValid;
    }
    /**
     * autobind decorator: This decorator is used to add .bind(this) to all needed fields
     * @param _ : the underscore is a mean to say we will not use this parameter but dont give an error for it
     * @param _2
     * @param descriptor
     * @returns
     */
    function autobind(_, _2, descriptor) {
        const originalMethod = descriptor.value;
        const adjstDescriptor = {
            configurable: true,
            get() {
                const boundFn = originalMethod.bind(this);
                return boundFn;
            },
        };
        return adjstDescriptor;
    }
    /**
     * Componenent Base Class
     */
    class Component {
        constructor(templateId, hostElementId, insertAtStart, newElementId) {
            this.templateElement = document.getElementById(templateId);
            this.hostElement = document.getElementById(hostElementId);
            const importedNode = document.importNode(this.templateElement.content, true);
            this.element = importedNode.firstElementChild;
            this.element.id = newElementId;
            this.attach(insertAtStart);
        }
        /**
         * adding the created code to the html page
         */
        attach(insertAtBeginning) {
            this.hostElement.insertAdjacentElement(insertAtBeginning ? "afterbegin" : "beforeend", this.element);
        }
    }
    class ProjectItem extends Component {
        constructor(hostId, project) {
            super("single-project", hostId, false, project.id);
            this.project = project;
            this.configure();
            this.renderContent();
        }
        get persons() {
            return this.project.people === 1
                ? "1 person "
                : `${this.project.people} persons`;
        }
        dragStartHandler(event) {
            console.log(event);
            event.dataTransfer.setData("text/plain", this.project.id);
            event.dataTransfer.effectAllowed = "move";
        }
        dragEndHandler(_) {
            console.log("drag end");
        }
        configure() {
            this.element.addEventListener("dragstart", this.dragStartHandler);
            this.element.addEventListener("dragend", this.dragStartHandler);
        }
        renderContent() {
            this.element.querySelector("h2").textContent = this.project.title;
            this.element.querySelector("h3").textContent =
                this.persons + " assigned";
            this.element.querySelector("p").textContent = this.project.description;
        }
    }
    __decorate([
        autobind
    ], ProjectItem.prototype, "dragStartHandler", null);
    __decorate([
        autobind
    ], ProjectItem.prototype, "dragEndHandler", null);
    /**
     * List for all the projects created in the class project
     */
    class ProjectList extends Component {
        constructor(type) {
            super("project-list", "app", false, `${type}-projects`);
            this.type = type;
            this.assignedProjects = [];
            this.configure();
            this.renderContent();
        }
        dragOverHandler(event) {
            if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
                event.preventDefault();
                const listEl = this.element.querySelector("ul");
                listEl.classList.add("droppable");
            }
        }
        dropHandler(event) {
            console.log("DROPHANDLER: " + event);
            const prjId = event.dataTransfer.getData("text/plain");
            projectState.moveProject(prjId, this.type === "active" ? App.ProjectStatus.Active : App.ProjectStatus.Finished);
        }
        dragLeaveHandler(_) {
            const listEl = this.element.querySelector("ul");
            listEl.classList.remove("droppable");
        }
        renderProjects() {
            const listEl = document.getElementById(`${this.type}-projects-list`);
            listEl.innerHTML = "";
            for (const prjItem of this.assignedProjects) {
                new ProjectItem(this.element.querySelector("ul").id, prjItem);
            }
        }
        renderContent() {
            const listId = `${this.type}-projects-list`;
            this.element.querySelector("ul").id = listId;
            this.element.querySelector("h2").textContent =
                this.type.toUpperCase() + " PROJECTS";
        }
        configure() {
            this.element.addEventListener("dragover", this.dragOverHandler);
            this.element.addEventListener("dragleave", this.dragLeaveHandler);
            this.element.addEventListener("drop", this.dropHandler);
            projectState.addListener((projects) => {
                const relevantProjects = projects.filter((prj) => {
                    if (this.type === "active") {
                        return prj.status === App.ProjectStatus.Active;
                    }
                    return prj.status === App.ProjectStatus.Finished;
                });
                this.assignedProjects = relevantProjects;
                this.renderProjects();
            });
        }
    }
    __decorate([
        autobind
    ], ProjectList.prototype, "dragOverHandler", null);
    __decorate([
        autobind
    ], ProjectList.prototype, "dropHandler", null);
    __decorate([
        autobind
    ], ProjectList.prototype, "dragLeaveHandler", null);
    /**
     * Class ProjectInput: Main class of the project
     */
    class ProjectInput extends Component {
        /**
         * The constructor for ProjectInput and will be used to get all the information of the page
         * not sure this is the best way, but this is what is said in the course
         */
        constructor() {
            super("project-input", "app", true, "user-input");
            this.titleInputElement = this.element.querySelector("#title");
            this.descriptionInputElement = this.element.querySelector("#description");
            this.peopleInput = this.element.querySelector("#people");
            this.configure();
        }
        submitHandler(event) {
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
        renderContent() { }
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
        gatherUserInput() {
            const enteredTitle = this.titleInputElement.value;
            const enteredDescription = this.descriptionInputElement.value;
            const enteredPeople = this.peopleInput.value;
            const titleValidatable = {
                value: enteredTitle,
                required: true,
            };
            const descriptionValidatable = {
                value: enteredDescription,
                required: true,
                minlength: 10,
            };
            const peopleValidatable = {
                value: +enteredPeople,
                required: true,
            };
            if (!(validate(titleValidatable) &&
                validate(descriptionValidatable) &&
                validate(peopleValidatable))) {
                alert("Error Validation");
                return;
            }
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
        /**
         * Resetting the fields of the page
         */
        clearInput() {
            this.titleInputElement.value = "";
            this.descriptionInputElement.value = "";
            this.peopleInput.value = "";
        }
    }
    __decorate([
        autobind
    ], ProjectInput.prototype, "submitHandler", null);
    __decorate([
        autobind
    ], ProjectInput.prototype, "gatherUserInput", null);
    /**
     * Create the instance of the class to get everything working
     * since all the code is in the constructor
     */
    new ProjectInput();
    new ProjectList("active");
    new ProjectList("finished");
})(App || (App = {}));
//# sourceMappingURL=bundle.js.map