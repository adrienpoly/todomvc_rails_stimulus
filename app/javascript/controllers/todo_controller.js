import { Controller } from "stimulus";
import pluralize from "pluralize";
import Rails from "rails-ujs";
import createDOMPurify from "dompurify";

const ALL = "all";
const COMPLETED = "completed";
const ACTIVE = "active";

export default class extends Controller {
  static targets = ["filter", "task", "activeNumber", "toggleAll"]

  connect() {
    this.initializeFilter();
    this.renderTodos();
    this.renderFilters();
  }

  initializeFilter() {
    const completedParam = new URLSearchParams(window.location.search).get(
      "completed"
    );

    this.filter =
      completedParam === null
        ? ALL
        : completedParam === "true" ? COMPLETED : ACTIVE;
  }

  create() {
    const form = this.targets.find("input-form");
    var self = this;
    this.handleSubmit(
      form,
      () => {
          const todoTitle = self.targets.find("todo-title");
          todoTitle.value = '';
          todoTitle.focus();
    });
  }

  toggle(event) {
    const todo = event.target.closest("li");
    const form = event.target.closest("form");
    this.handleSubmit(form);
    Rails.fire(form, "submit");
  }

  destroy(event) {
    const form = event.target.closest("form");
    this.handleSubmit(form);
  }

  toggleAll(event) {
    const form = event.target.closest("form");
    this.handleSubmit(form);
    Rails.fire(form, "submit");
  }

  destroyAll() {
    this.completedTaskElements.forEach(task => {
      task.classList.add("hidden");
    });
  }

  selectFilter(event) {
    this.filter = event.target.name;
    this.renderTodos();
    this.renderFilters();
  }

  setActiveNumber() {
    const DOMPurify = createDOMPurify(window);
    const activeNumberStr = `${this.active} ${pluralize(
      "item",
      this.active
    )} left`;
    this.displayActive.innerHTML = DOMPurify.sanitize(activeNumberStr);
  }

  renderTodos() {
    this.taskElements.forEach(element => {
      if (this.filter === ALL) {
        element.classList.remove("hidden");
      } else if (this.filter === COMPLETED) {
        element.classList.toggle(
          "hidden",
          !element.classList.contains("completed")
        );
      } else {
        element.classList.toggle(
          "hidden",
          element.classList.contains("completed")
        );
      }
    });
  }

  renderFilters() {
    this.filterElements.forEach(filter => {
      filter.classList.toggle("selected", filter.name === this.filter);
    });
  }

  handleSubmit(form, callback = () => {}) {
    var self = this;
    const success = event => {
      const todosOld = document.querySelector("#todos");
      const todosNew = event.detail[0].querySelector("#todos");
      todosOld.parentNode.replaceChild(todosNew, todosOld);

      callback();
      self.connect();
      self.setActiveNumber();
      form.removeEventListener("ajax:success", success);
    };
    form.addEventListener("ajax:success", success);
  }

  set active(value) {
    this.data.set("active", value);
  }

  set filter(name) {
    this.data.set("filter", name);
  }

  set isToggleAll(bool) {
    this.data.set("toggleAll", bool);
  }

  get isToggleAll() {
    return this.data.get("toggleAll") === "true";
  }

  get filter() {
    if (this.data.has("filter")) {
      return this.data.get("filter");
    } else {
      return;
    }
  }

  get displayActive() {
    return this.activeNumberTarget;
  }

  get active() {
    return this.activeTaskElements.length;
  }

  get taskElements() {
    return this.taskTargets;
  }

  get filterElements() {
    return this.filterTargets;
  }

  get completedTaskElements() {
    return this.taskElements.filter(task => {
      return task.classList.contains("completed");
    });
  }

  get activeTaskElements() {
    return this.taskElements.filter(task => {
      return !task.classList.contains("completed");
    });
  }
}
