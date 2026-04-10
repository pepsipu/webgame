import defaultGameFile from "./default.game.xml?raw";
import doublePendulumGameFile from "./double-pendulum.game.xml?raw";

type Tab = {
  name: string;
  text: string;
};

type EditorState = {
  activeTabIndex: number;
  tabs: Tab[];
};

const storageKey = "webgames.editor";
const defaultTabs: readonly Tab[] = [
  {
    name: "default.game.xml",
    text: defaultGameFile,
  },
  {
    name: "double-pendulum.game.xml",
    text: doublePendulumGameFile,
  },
];
const defaultTabCount = defaultTabs.length;

export function createEditor(onLoad: (text: string) => void): HTMLDivElement {
  const state = loadEditorState();
  let activeTabIndex = state.activeTabIndex;
  const tabList = [...defaultTabs.map((tab) => ({ ...tab })), ...state.tabs];

  const editor = document.createElement("div");
  editor.id = "editor";

  const tabsElement = document.createElement("div");
  tabsElement.id = "editor-tabs";

  const textarea = document.createElement("textarea");
  textarea.id = "gamefile-input";

  editor.append(tabsElement, textarea);

  textarea.addEventListener("input", updateActiveTabText);
  textarea.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") {
      return;
    }

    event.preventDefault();
    textarea.setRangeText(
      "  ",
      textarea.selectionStart,
      textarea.selectionEnd,
      "end",
    );
    updateActiveTabText();
  });

  render();
  onLoad(activeTab().text);

  return editor;

  function updateActiveTabText(): void {
    activeTab().text = textarea.value;
    saveEditorState(activeTabIndex, tabList);
    onLoad(textarea.value);
  }

  function render(): void {
    tabsElement.replaceChildren();

    for (const [index, tab] of tabList.entries()) {
      const button = document.createElement("button");
      button.disabled = index === activeTabIndex;
      button.textContent = tab.name;
      button.addEventListener("click", () => {
        setActiveTab(index);
      });
      tabsElement.append(button);

      if (index < defaultTabCount) {
        continue;
      }

      const closeButton = document.createElement("button");
      closeButton.textContent = "x";
      closeButton.addEventListener("click", () => {
        deleteTab(index);
      });
      tabsElement.append(closeButton);
    }

    const addButton = document.createElement("button");
    addButton.textContent = "+";
    addButton.addEventListener("click", addTab);
    tabsElement.append(addButton);
    textarea.value = activeTab().text;
  }

  function activeTab(): Tab {
    return tabList[activeTabIndex]!;
  }

  function setActiveTab(index: number): void {
    activeTabIndex = index;
    render();
    saveEditorState(activeTabIndex, tabList);
    onLoad(activeTab().text);
  }

  function addTab(): void {
    tabList.push({
      name: `tab ${tabList.length}`,
      text: activeTab().text,
    });
    setActiveTab(tabList.length - 1);
  }

  function deleteTab(index: number): void {
    tabList.splice(index, 1);
    setActiveTab(
      activeTabIndex > index
        ? activeTabIndex - 1
        : Math.min(activeTabIndex, tabList.length - 1),
    );
  }
}

function loadEditorState(): EditorState {
  return JSON.parse(
    localStorage.getItem(storageKey) ?? '{"activeTabIndex":1,"tabs":[]}',
  ) as EditorState;
}

function saveEditorState(activeTabIndex: number, tabs: readonly Tab[]): void {
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      activeTabIndex,
      tabs: tabs.slice(defaultTabCount),
    } satisfies EditorState),
  );
}
