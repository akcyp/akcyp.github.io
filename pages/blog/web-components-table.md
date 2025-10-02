# Creating web components table

In this post, I’ll walk through building a flexible, reusable table component using Web Components. The goal is to create a table that can be easily integrated into any project and framework, with customizable columns, cell rendering, and efficient updates.

## Project assumptions {#task}

For this project, I assume you have a basic understanding of JavaScript, TypeScript, and the concept of Web Components. The table is designed to be framework-agnostic, but the patterns here are inspired by modern frontend frameworks. You can find the full source code on Github Repositorium: https://github.com/akcyp/angular-webcomponents-hybrid-table/tree/main/src/webcomponents

## Usage example

Here is a simple example of how we are going to use the custom table component:

::: code-group
```html [index.html]
<body>
  <custom-table></custom-table>
</body>
```
```ts [script.ts]
const table = document.querySelector('custom-table') as CustomTable;
table.columns = [
  // column definitions ...
  {
    prop: 'id',
    header: 'ID',
    renderCell(props, rowIndex) {
      const p = document.createElement('p');
      p.style.color = 'red';
      p.innerHTML = props['id'];
      return p;
    },
    updateCell(props, rowIndex, cell) {
      cell.firstElementChild.innerHTML = props['id'];
    },
    removeCell(cell) {
      cell.firstElementChild.remove();
    }
  }
];
table.items = [
  // row data ...
  { id: 'one' },
  { id: 'two' },
  { id: 'three' },
];
```
:::

The developer must be able to define columns with custom rendering logic and provide the data as an array of objects.

## Model

The table's data model is simple and flexible. Each row is represented by a `TableItem` object, and columns are described by the `TableColumn` interface. Columns can define custom rendering, updating, and removal logic for both headers and cells.

```ts
export interface TableItem {
  id: string;
  [k: string]: unknown;
}

export type TableElement = HTMLElement | DocumentFragment;

export interface TableColumn {
  prop: string;
  header?: string;

  renderHeader?: () => TableElement;
  updateHeader?: (cell: TableElement) => void;
  removeHeader?: (cell: TableElement) => void;

  renderCell?: (props: TableItem, rowIndex: number) => TableElement;
  updateCell?: (props: TableItem, rowIndex: number, cell: TableElement) => void;
  removeCell?: (cell: TableElement) => void;
}
```

## Web component definition

The core of the table is a custom element, `CustomTable`, which manages its own shadow DOM. It exposes columns and data properties, and efficiently updates the DOM when these change. The component uses private methods to handle updates and diffing.

```ts
export interface TableProps {
  columns: TableColumn[];
  data: TableItem[];
}

export class CustomTable extends HTMLElement {
  #shadow: ShadowRoot;
  #props: TableProps = {
    columns: [],
    data: [],
  };

  private updateColumns(oldColumns: TableColumn[], newColumns: TableColumn[]) {}
  private updateRows(oldRows: TableItem[], newRows: TableItem[]) {}

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const style = document.createElement('style');
    style.innerHTML = '/* Optional table styles */';
    this.#shadow.appendChild(style);

    const $table = document.createElement('table');
    const $thead = document.createElement('thead');
    const $tbody = document.createElement('tbody');
    $table.appendChild($thead);
    $table.appendChild($tbody);
    this.#shadow.appendChild($table);
  }

  get columns() {
    return this.#props.columns;
  }

  set columns(value: TableColumn[]) {
    this.updateColumns(this.#props.columns, value);
    this.#props.columns = value;
  }

  get data() {
    return this.#props.data;
  }

  set data(value:TableItem[]) {
    this.updateRows(this.#props.data, value);
    this.#props.data = value;
  }
}

customElements.define('custom-table', CustomTable);
```

## Table abstraction

To keep the DOM manipulation logic organized, I introduced a TableDOM class. This class abstracts the creation, updating, and removal of table headers and rows. It provides a clean API for adding, updating, and removing both headers and rows, making the main component code much simpler.

```ts
type TableElement = HTMLElement | DocumentFragment;
type WithContainer<T> = T & { $: TableElement };
type TableDOMCell = WithContainer<{ prop: string }>;
type TableDOMRow = WithContainer<{ id: string; cells: TableDOMCell[] }>;

export class TableDOM {
  readonly headersContainer = document.createElement('tr');
  readonly rowsContainer = document.createElement('tbody');
  private headers: TableDOMCell[] = [];
  private rows: TableDOMRow[] = [];

  private getHeader(prop: string) {
    return this.headers.find((header) => header.prop === prop);
  }

  private getRow(id: string) {
    return this.rows.find((row) => row.id === id);
  }

  private addHeaderCellAt(column: TableColumn, index: number) {
    const $th = createTableHeader(column);
    this.headers.splice(index, 0, { prop: column.prop, $: $th });
    insertChildAtIndex(this.headersContainer, $th, index);
  }

  private updateHeaderCell(column: TableColumn) {
    const header = this.getHeader(column.prop)!;
    updateTableHeader(header.$, column);
  }

  private removeHeaderCell(column: TableColumn) {
    const header = this.getHeader(column.prop)!;
    this.headers.splice(this.headers.indexOf(header), 1);
    destroyTableHeader(header.$, column);
  }

  private addRowCellAt(column: TableColumn, columnIndex: number, item: TableItem, itemIndex: number) {
    const row = this.getRow(item.id)!;
    const $td = createTableCell(column, itemIndex, item);
    insertChildAtIndex(row.$, $td, columnIndex);

    row.cells.splice(columnIndex, 0, {
      prop: column.prop,
      $: $td,
    });
  }

  private updateRowCell(column: TableColumn, item: TableItem, itemIndex: number) {
    const row = this.getRow(item.id)!;
    const cell = row.cells.find((cell) => cell.prop === column.prop)!;
    updateTableCell(cell.$, column, item, itemIndex);
  }

  private removeRowCell(column: TableColumn, id: string) {
    const row = this.getRow(id)!;
    const cellIndex = row.cells.findIndex((cell) => cell.prop === column.prop);
    const cell = row.cells[cellIndex];
    destroyTableCell(cell.$, column);
    row.cells.splice(cellIndex, 1);
  }

  // Public API

  public addRow(columns: TableColumn[], item: TableItem, itemIndex: number) {
    const $tr = document.createElement('tr');
    insertChildAtIndex(this.rowsContainer!, $tr, itemIndex);

    this.rows.splice(itemIndex, 0, {
      id: item.id,
      $: $tr,
      cells: [],
    });

    columns.forEach((column, columnIndex) => {
      this.addRowCellAt(column, columnIndex, item, itemIndex);
    });
  }

  public updateRow(columns: TableColumn[], item: TableItem, itemIndex: number) {
    const row = this.getRow(item.id)!;
    row.cells.forEach((cell) => {
      const column = columns.find((column) => column.prop === cell.prop)!;
      this.updateRowCell(column, item, itemIndex);
    });
  }

  public removeRow(columns: TableColumn[], id: string) {
    const row = this.getRow(id)!;
    const rowIndex = this.rows.indexOf(row);
    row.cells.forEach((cell) => {
      const column = columns.find(({ prop }) => prop === cell.prop)!;
      this.removeRowCell(column, id);
    });
    this.rows.splice(rowIndex, 1);
    this.rowsContainer.removeChild(row.$);
  }

  // Headers

  public addHeader(column: TableColumn, index: number, data: TableItem[]) {
    this.addHeaderCellAt(column, index);
    for (const row of this.rows) {
      const itemIndex = data.findIndex(({ id }) => id === row.id);
      const item = data[itemIndex];
      this.addRowCellAt(column, index, item, itemIndex);
    }
  }

  public updateHeader(column: TableColumn, reloadRowCells: boolean, data: TableItem[]) {
    this.updateHeaderCell(column);
    if (!reloadRowCells) return;
    for (const row of this.rows) {
      const columnIndex = row.cells.findIndex((cell) => cell.prop === column.prop);
      this.removeRowCell(column, row.id);
      const itemIndex = data.findIndex((item) => item.id === row.id);
      const item = data[itemIndex];
      this.addRowCellAt(column, columnIndex, item, itemIndex);
    }
  }

  public removeHeader(column: TableColumn) {
    this.removeHeaderCell(column);
    for (const row of this.rows) {
      this.removeRowCell(column, row.id);
    }
  }
}
```

A set of utility functions handle common DOM operations, such as creating elements with content, inserting children at specific indexes, and managing table headers and cells. These utilities help keep the code DRY and maintainable.

### Utils
::: details createElementWithContent(tagName, content)
```ts
export const createElementWithContent = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  content: unknown
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tagName);
  const contentElement = document.createTextNode(String(content));
  element.appendChild(contentElement);
  return element;
};
```
:::
::: details insertChildAtIndex(parent, child, index)
```ts
export const insertChildAtIndex = (parent: TableElement, child: TableElement, index: number) => {
  if (!index) index = 0;
  if (index >= parent.children.length) {
    parent.appendChild(child);
  } else {
    parent.insertBefore(child, parent.children[index]);
  }
};
```
:::
::: details createTableHeader(column)
```ts
export const createTableHeader = (column: TableColumn) => {
  if (column.renderHeader) {
    return column.renderHeader();
  }
  return createElementWithContent('th', column.header);
};
```
:::
::: details updateTableHeader($th, column)
```ts
export const updateTableHeader = ($th: TableElement, column: TableColumn) => {
  if (column.updateHeader) {
    column.updateHeader($th);
    return;
  }
  if ($th instanceof HTMLElement) {
    $th.replaceChildren(document.createTextNode(column.header ?? ''));
  }
};
```
:::
::: details destroyTableHeader($th, column)
```ts
export const destroyTableHeader = ($th: TableElement, column: TableColumn) => {
  if (column.removeHeader) {
    column.removeHeader($th);
    return;
  }
  $th.parentNode?.removeChild($th);
};
```
:::
::: details createTableCell(column, rowIndex, value)
```ts
export const createTableCell = (column: TableColumn, rowIndex: number, value: TableItem) => {
  if (column.renderCell) {
    return column.renderCell(value, rowIndex);
  }
  return createElementWithContent('td', value[column.prop]);
};
```
:::
::: details updateTableCell($td, column, item, rowIndex)
```ts
export const updateTableCell = (
  $td: TableElement,
  column: TableColumn,
  item: TableItem,
  rowIndex: number
) => {
  if (column.updateCell) {
    column.updateCell(item, rowIndex, $td);
    return;
  }
  if ($td instanceof HTMLElement) {
    $td.replaceChildren(document.createTextNode(String(item[column.prop] ?? '')));
  }
};
```
:::
::: details destroyTableCell($td, column)
```ts
export const destroyTableCell = ($td: TableElement, column: TableColumn) => {
  if (column.removeCell) {
    column.removeCell($td);
    return;
  }
  $td.parentNode?.removeChild($td);
};
```
:::

## Diffing algorithm

Efficient updates are crucial for good performance. The `diffArrayOfObject` function compares old and new arrays of objects (such as columns or rows) and returns a list of added, removed, and updated items. This allows the table to update only what's necessary, minimizing DOM operations.

```ts
type DictionaryDiff<T> = {
  [K in keyof T]: {
    prop: K;
    oldValue: T[K];
    newValue: T[K];
  };
}[keyof T];

interface ArrayDiff<R extends string, T extends Record<R, string>> {
  removed: { ref: string; value: T }[];
  added: { ref: string; index: number; value: T }[];
  updated: { ref: string; index: number; value: T; updates: DictionaryDiff<T>[] }[];
}

export const diffArrayOfObject = <R extends string, T extends Record<R, string>>(
  refercence: R,
  oldValue: T[],
  newValue: T[]
): ArrayDiff<R, T> => {
  const oldMap = new Map(oldValue.map((item) => [item[refercence], item]));
  const newMap = new Map(newValue.map((item) => [item[refercence], item]));

  const removed: { ref: string; value: T }[] = [];
  const added: { ref: string; index: number; value: T }[] = [];
  const updated: { ref: string; index: number; value: T; updates: DictionaryDiff<T>[] }[] = [];

  for (const [id, oldValue] of oldMap.entries()) {
    if (!newMap.has(id)) {
      removed.push({ ref: id, value: oldValue });
    }
  }

  newValue.forEach((newItem, index) => {
    const oldItem = oldMap.get(newItem[refercence]);
    if (!oldItem) {
      added.push({ ref: newItem[refercence], index, value: newItem });
      return;
    }

    const updates: DictionaryDiff<T>[] = [];
    for (const key in newItem) {
      if (key !== 'id' && oldItem[key] !== newItem[key]) {
        updates.push({
          prop: key as keyof T,
          oldValue: oldItem[key],
          newValue: newItem[key],
        });
      }
    }
    if (updates.length > 0) {
      updated.push({ ref: newItem[refercence], value: newItem, updates, index });
    }
  });

  return { removed, added, updated };
};
```

## Wrapping up

By combining Web Components, a clean data model, and efficient DOM updates, we get a highly customizable and performant table component. This approach can be extended with features like sorting, filtering, or pagination as needed.

```ts
export class CustomTable extends HTMLElement {
  #shadow: ShadowRoot;
  #props: TableProps = {
    columns: [],
    data: [],
  };

  #table = new TableDOM(); // [!code ++]

  private updateColumns(oldColumns: TableColumn[], newColumns: TableColumn[]) {
    const diff = diffArrayOfObject('prop', oldColumns, newColumns); // [!code ++]

    diff.removed.forEach(({ value: column }) => { // [!code ++]
      this.#table.removeHeader(column); // [!code ++]
    }); // [!code ++]

    diff.updated.forEach(({ value: column, updates }) => { // [!code ++]
      const shouldForceUpadeRows = updates.some((update) => // [!code ++]
        ['renderCell', 'updateCell', 'removeCell'].includes(update?.prop ?? '') // [!code ++]
      ); // [!code ++]
      this.#table.updateHeader(column, shouldForceUpadeRows, this.data); // [!code ++]
    }); // [!code ++]

    diff.added.forEach(({ index, value: column }) => { // [!code ++]
      this.#table.addHeader(column, index, this.data); // [!code ++]
    }); // [!code ++]
  }

  private updateRows(oldRows: TableItem[], newRows: TableItem[]) {
    const diff = diffArrayOfObject('id', oldRows, newRows); // [!code ++]

    diff.removed.forEach(({ ref }) => { // [!code ++]
      this.#table.removeRow(this.columns, ref); // [!code ++]
    }); // [!code ++]

    diff.updated.forEach(({ value, index }) => { // [!code ++]
      this.#table.updateRow(this.columns, value, index); // [!code ++]
    }); // [!code ++]

    diff.added.forEach(({ value, index }) => { // [!code ++]
      this.#table.addRow(this.columns, value, index); // [!code ++]
    }); // [!code ++]
  }

  // ...
}
```

## Final notes

Building a table component with Web Components provides a powerful, framework-agnostic solution that can be reused across different projects and stacks. The approach outlined here emphasizes flexibility, maintainability, and performance through efficient DOM updates and a clean abstraction layer.

If you're interested in integrating this (or similar) table component with Angular, stay tuned! A follow-up blog post will cover best practices and patterns for seamless integration with Angular applications. Be sure to check back soon for more details and examples.
