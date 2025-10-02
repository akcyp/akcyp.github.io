# Angular + Web Components Table Integration

Suppose your company uses an internal component library built with Web Components to support multiple frameworks like React, Vue, and Angular. Or perhaps you're using a favorite Web Components library written in Lit or Stencil. Integrating these components with React is usually straightforward, but with Angular, things can get a bit tricky.

One of the main challenges is that Web Components don't support “dynamic” templates - a feature that Angular developers often rely on. For example, Angular Material tables use a declarative approach with templates:

```html
<table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
  <ng-container matColumnDef="position">
    <th mat-header-cell *matHeaderCellDef> No. </th>
    <td mat-cell *matCellDef="let element"> {{element.position}} </td>
  </ng-container>
</table>
```

In contrast, most Web Component table libraries require you to define columns and cell rendering logic in JavaScript:

```js
const table = document.querySelector('custom-table') as CustomTable;
table.columns = [{
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
}];
table.items = [
  { id: 'one' },
  { id: 'two' },
  { id: 'three' },
];
```

While this approach works, it's not ideal for Angular developers who want to avoid direct DOM manipulation.

The good news? With a bit of internal Angular API knowledge, you can integrate a Web Components table with Angular templates and achieve an API similar to Angular Material tables!

You can find the full code and a working demo here:
https://github.com/akcyp/angular-webcomponents-hybrid-table

## Requirements

The Web Component table API should accept the following properties:

- data: An array of objects representing the table rows.
- columns: An array of objects defining the columns' structure and properties, including lifecycle functions for rendering, updating, and cleanup.
Developers should be able to specify three lifecycle functions for row cells (and optionally for header cells):
  - render: Function to render the cell content initially.
  - update: Function to update the cell content when data changes.
  - beforeRemove: Function to perform cleanup or actions before the cell is removed.

## Step 1 - Creating the Integration Module

First, create an Angular module that declares and exports the necessary directives for table, column, cell, and header cell definitions.

```ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HybridTableDirective } from './directives/table.directive';
import { HybridColumnDefDirective } from './directives/column.directive';
import { HybridCellDefDirective } from './directives/cell.directive';
import { HybridHeaderCellDefDirective } from './directives/header-cell.directive';

@NgModule({
  declarations: [HybridTableDirective, HybridColumnDefDirective, HybridCellDefDirective, HybridHeaderCellDefDirective],
  exports: [HybridTableDirective, HybridColumnDefDirective, HybridCellDefDirective, HybridHeaderCellDefDirective],
  imports: [CommonModule],
  providers: [],
})
export class HybridTableModule {}
```

This module should then be imported into your main app module or standalone component.

```ts
// With standalone components
@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [CommonModule, HybridTableModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent {}

// With root module
@NgModule({
  declarations: [AppComponent],
  imports: [CommonModule, HybridTableModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [],
})
export class AppModule {}
```

## Step 2 - Creating Column, Header, and Cell Directives

Define Angular directives for columns, header cells, and cell templates. These directives allow you to use Angular templates for table headers and cells, making your table definition more declarative and familiar to Angular developers.

::: code-group
```ts [column.directive.ts]
import { ContentChild, Directive, Input } from '@angular/core';

import { HybridHeaderCellDefDirective } from './header-cell.directive';
import { HybridCellDefDirective } from './cell.directive';

@Directive({ selector: '[hybridColumnDef]' })
export class HybridColumnDefDirective<H, C> {
  @Input('hybridColumnDef') column!: string;
  @ContentChild(HybridHeaderCellDefDirective) headerDef?: HybridHeaderCellDefDirective<H>;
  @ContentChild(HybridCellDefDirective) cellDef?: HybridCellDefDirective<C>;
}
```
```ts [header.directive.ts]
import { Directive, TemplateRef } from '@angular/core';

@Directive({ selector: '[hybridHeaderCellDef]' })
export class HybridHeaderCellDefDirective<C> {
  constructor(public templateRef: TemplateRef<C>) {}
}
```
```ts [cell.directive.ts]
import { Directive, TemplateRef } from '@angular/core';

@Directive({ selector: '[hybridCellDef]' })
export class HybridCellDefDirective<C> {
  constructor(public templateRef: TemplateRef<C>) {}
}
```
:::

## Step 3 - Creating the Table Decorator Directive

Next, implement a directive that decorates the table element. This directive collects the column definitions and prepares the columns array for the Web Component. It also listens for changes in the column definitions and updates the columns accordingly.

```ts
import {
  AfterContentInit,
  ContentChildren,
  Directive,
  HostBinding,
  OnChanges,
  OnDestroy,
  QueryList,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import { HybridColumnDefDirective } from './column.directive';
import { Subject, takeUntil } from 'rxjs';

// We will talk about these utility methods in next section
import { convertHeaderCellTemplate } from '../view-attacher/convertHeaderCellTemplate.ts';
import { convertCellTemplate } from '../view-attacher/convertCellTemplate.ts';

@Directive({ selector: '[hybrid-table]' })
export class HybridTableDirective implements AfterContentInit, OnDestroy, OnChanges {
  private destroy$ = new Subject();
  private _columns: Record<string, unknown>[] = [];

  @ContentChildren(HybridColumnDefDirective) columnsDefTemplates?: QueryList<
    HybridColumnDefDirective<
      {},
      {
        $implicit: Record<string, unknown>;
      }
    >
  >;

  @HostBinding('columns') get cols() {
    return this._columns;
  }

  constructor(private vcr: ViewContainerRef) {}

  ngAfterContentInit() {
    this.reloadColumns();
    this.columnsDefTemplates!.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.reloadColumns();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['columns'] && this.columnsDefTemplates) {
      this.reloadColumns();
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
  }

  private reloadColumns() {
    this._columns = (this.columnsDefTemplates ?? []).map(({ column, cellDef, headerDef }) => {
      const result: Record<string, unknown> = { prop: column };
      if (cellDef) {
        const props = convertCellTemplate(cellDef.templateRef, this.vcr);
        Object.assign(result, props);
      }
      if (headerDef) {
        const props = convertHeaderCellTemplate(headerDef.templateRef, this.vcr);
        Object.assign(result, props);
      }
      return result;
    });
  }
}
```

## Step 4 - Attaching Angular Views to Cell and Header DOM Elements

To render Angular templates inside the Web Component's cells and headers, use Angular's embedded views. This step involves utility functions that attach and detach Angular views to the appropriate DOM elements, ensuring that updates and cleanup are handled correctly.

::: code-group
```ts [attacher.ts]
import { EmbeddedViewRef, TemplateRef, ViewContainerRef } from '@angular/core';

// We can store Angular's Embdedded view inside HTMLElement
// not ideal but works
const attachSymbol = Symbol();
export const assignAngularViewToHTMLElement = (element: HTMLElement, view: EmbeddedViewRef<any>) => {
  (element as any)[attachSymbol] = view;
};
export const unassignAngularViewFromHTMLElement = (element: HTMLElement) => {
  (element as any)[attachSymbol] = undefined;
};
export const getAssignedAngularViewFromHTMLElement = (element: HTMLElement) => {
  return (element as any)[attachSymbol] as EmbeddedViewRef<any>;
};

export const attachEmbeddedViewToHTMLElement = <C>(
  element: HTMLElement,
  vcr: ViewContainerRef,
  templateRef: TemplateRef<C>,
  context: C
) => {
  const embeddedView = templateRef.createEmbeddedView(context);
  vcr.insert(embeddedView);
  embeddedView.onDestroy(() => {
    // Old angular versions does not support automatic detach
    const index = vcr.indexOf(embeddedView);
    if (index > -1) {
      vcr.remove(index);
    }
  });
  element.append(...embeddedView.rootNodes);
  assignAngularViewToHTMLElement(element, embeddedView);
  return embeddedView;
};

export const detachEmbeddedViewFromHTMLElement = <C>(element: HTMLElement, view: EmbeddedViewRef<C>) => {
  view.destroy();
  view.rootNodes.forEach((node) => (node as HTMLElement).parentNode?.removeChild(node));
  unassignAngularViewFromHTMLElement(element);
};
```
```ts [convertCellTemplate.ts]
import {
  attachEmbeddedViewToHTMLElement,
  getAssignedAngularViewFromHTMLElement,
  detachEmbeddedViewFromHTMLElement
} from './attacher.ts';

export const convertCellTemplate = (
  templateRef: TemplateRef<{
    $implicit: Record<string, unknown>;
  }>,
  vcr: ViewContainerRef
) => {
  return {
    renderCell(props, rowIndex) {
      const fragment = document.createDocumentFragment();
      attachEmbeddedViewToHTMLElement(fragment, vcr, templateRef, { $implicit: props });
      return fragment;
    },
    updateCell(props, rowIndex, fragment) {
      const context = { $implicit: props };
      const view = getAssignedAngularViewFromHTMLElement(fragment);
      Object.assign(view.context, context);
      view.detectChanges();
    },
    removeCell(fragment) {
      const view = getAssignedAngularViewFromHTMLElement(fragment);
      if (!view) return;
      detachEmbeddedViewFromHTMLElement(fragment, view);
    },
  };
};
```
```ts [convertHeaderCellTemplate.ts]
import {
  attachEmbeddedViewToHTMLElement,
  getAssignedAngularViewFromHTMLElement,
  detachEmbeddedViewFromHTMLElement
} from './attacher.ts';

export const convertHeaderCellTemplate = (
  templateRef: TemplateRef<{}>,
  vcr: ViewContainerRef
) => {
  return {
    renderHeader() {
      const fragment = document.createDocumentFragment();
      attachEmbeddedViewToHTMLElement(fragment, vcr, templateRef, {});
      return fragment;
    },
    updateHeader(fragment) {
      const context = {};
      const view = getAssignedAngularViewFromHTMLElement(fragment);
      Object.assign(view.context, context);
      view.detectChanges();
    },
    removeHeader(fragment) {
      const view = getAssignedAngularViewFromHTMLElement(fragment);
      if (!view) return;
      detachEmbeddedViewFromHTMLElement(fragment, view);
    },
  };
};
```
:::

## Summary

By following these steps, you can seamlessly integrate a Web Components-based table into your Angular application, leveraging Angular's powerful templating system while maintaining compatibility with your existing Web Components library.

If you'd like to see the full implementation and a live demo, check out the GitHub repository.
