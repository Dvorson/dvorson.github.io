// Type declarations for test modules

// Preact module definition
declare module "preact" {
  export function h(type: any, props: any, ...children: any[]): any;
  export interface VNode<P = {}> {
    type: string | ComponentType<P>;
    props: P & { children?: VNode[] | VNode | string | number | null };
    key?: string | number | null;
    ref?: any;
  }
  export interface ComponentType<P = {}> {
    (props: P): VNode<any> | null;
    displayName?: string;
  }
  export interface FunctionComponent<P = {}> {
    (props: P): VNode<any> | null;
    displayName?: string;
  }
  export interface ComponentClass<P = {}, S = {}> {
    new(props: P): Component<P, S>;
    displayName?: string;
  }
  export class Component<P = {}, S = {}> {
    constructor(props: P);
    props: P & { children?: any };
    state: S;
    setState(state: Partial<S>, callback?: () => void): void;
    forceUpdate(callback?: () => void): void;
    render(): VNode<any> | null;
  }
  export interface Attributes {
    key?: string | number | null;
    ref?: any;
  }
  export interface ClassAttributes<T> extends Attributes {
    ref?: any;
  }
}

// Preact hooks module definition
declare module "preact/hooks" {
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useRef<T>(initialValue: T | null): { current: T | null };
  export function useContext<T>(context: any): T;
  export function useReducer<S, A>(reducer: (state: S, action: A) => S, initialState: S, init?: (s: S) => S): [S, (action: A) => void];
  export function useCallback<T extends Function>(callback: T, deps: any[]): T;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export function useLayoutEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useDebugValue(value: any, format?: (value: any) => any): void;
  export const __H: { current: any };
}

declare module "happy-dom" {
  export class Window {
    document: Document;
    navigator: Navigator;
    HTMLElement: typeof HTMLElement;
    Element: typeof Element;
    Node: typeof Node;
    MutationObserver?: any;
  }
}

declare module "preact-testing-library" {
  import { VNode } from "preact";
  
  export const fireEvent: {
    click: (element: Element, options?: any) => boolean;
    change: (element: Element, options?: any) => boolean;
    input: (element: Element, options?: any) => boolean;
    submit: (element: Element, options?: any) => boolean;
    keyDown: (element: Element, options?: any) => boolean;
    keyUp: (element: Element, options?: any) => boolean;
    keyPress: (element: Element, options?: any) => boolean;
    focus: (element: Element, options?: any) => boolean;
    blur: (element: Element, options?: any) => boolean;
    [key: string]: (element: Element, options?: any) => boolean;
  };

  export interface RenderResult {
    container: HTMLElement;
    unmount: () => void;
    rerender: (ui: VNode) => void;
    asFragment: () => DocumentFragment;
    debug: (baseElement?: HTMLElement) => void;
    findAllByAltText: (text: string) => Promise<HTMLElement[]>;
    findAllByDisplayValue: (value: string) => Promise<HTMLElement[]>;
    findAllByLabelText: (text: string) => Promise<HTMLElement[]>;
    findAllByPlaceholderText: (text: string) => Promise<HTMLElement[]>;
    findAllByRole: (role: string) => Promise<HTMLElement[]>;
    findAllByTestId: (id: string) => Promise<HTMLElement[]>;
    findAllByText: (text: string | RegExp) => Promise<HTMLElement[]>;
    findAllByTitle: (title: string) => Promise<HTMLElement[]>;
    findByAltText: (text: string) => Promise<HTMLElement>;
    findByDisplayValue: (value: string) => Promise<HTMLElement>;
    findByLabelText: (text: string) => Promise<HTMLElement>;
    findByPlaceholderText: (text: string) => Promise<HTMLElement>;
    findByRole: (role: string) => Promise<HTMLElement>;
    findByTestId: (id: string) => Promise<HTMLElement>;
    findByText: (text: string | RegExp) => Promise<HTMLElement>;
    findByTitle: (title: string) => Promise<HTMLElement>;
    getAllByAltText: (text: string) => HTMLElement[];
    getAllByDisplayValue: (value: string) => HTMLElement[];
    getAllByLabelText: (text: string) => HTMLElement[];
    getAllByPlaceholderText: (text: string) => HTMLElement[];
    getAllByRole: (role: string) => HTMLElement[];
    getAllByTestId: (id: string) => HTMLElement[];
    getAllByText: (text: string | RegExp) => HTMLElement[];
    getAllByTitle: (title: string) => HTMLElement[];
    getByAltText: (text: string) => HTMLElement;
    getByDisplayValue: (value: string) => HTMLElement;
    getByLabelText: (text: string) => HTMLElement;
    getByPlaceholderText: (text: string) => HTMLElement;
    getByRole: (role: string) => HTMLElement;
    getByTestId: (id: string) => HTMLElement;
    getByText: (text: string | RegExp) => HTMLElement;
    getByTitle: (title: string) => HTMLElement;
    queryAllByAltText: (text: string) => HTMLElement[];
    queryAllByDisplayValue: (value: string) => HTMLElement[];
    queryAllByLabelText: (text: string) => HTMLElement[];
    queryAllByPlaceholderText: (text: string) => HTMLElement[];
    queryAllByRole: (role: string) => HTMLElement[];
    queryAllByTestId: (id: string) => HTMLElement[];
    queryAllByText: (text: string | RegExp) => HTMLElement[];
    queryAllByTitle: (title: string) => HTMLElement[];
    queryByAltText: (text: string) => HTMLElement | null;
    queryByDisplayValue: (value: string) => HTMLElement | null;
    queryByLabelText: (text: string) => HTMLElement | null;
    queryByPlaceholderText: (text: string) => HTMLElement | null;
    queryByRole: (role: string) => HTMLElement | null;
    queryByTestId: (id: string) => HTMLElement | null;
    queryByText: (text: string | RegExp) => HTMLElement | null;
    queryByTitle: (title: string) => HTMLElement | null;
  }

  export function render(ui: VNode, options?: any): RenderResult;
  export function cleanup(): void;
}

// Deno standard library module declarations
declare module "std/assert/mod.ts" {
  export function assertEquals<T>(actual: T, expected: T, msg?: string): void;
  export function assertExists<T>(actual: T | null | undefined, msg?: string): T;
  export function assertNotEquals<T>(actual: T, expected: T, msg?: string): void;
  export function assertStrictEquals<T>(actual: T, expected: T, msg?: string): void;
  export function assertThrows(fn: () => void, ErrorClass?: any, msgIncludes?: string): Error;
  export function assertThrowsAsync(fn: () => Promise<void>, ErrorClass?: any, msgIncludes?: string): Promise<Error>;
  export function assert(condition: unknown, msg?: string): asserts condition;
  export function assertMatch(actual: string, expected: RegExp, msg?: string): void;
  export function assertArrayIncludes<T>(actual: T[], expected: T[], msg?: string): void;
  export function unreachable(): never;
}

declare module "testing/mock.ts" {
  export function spy<T = any, A extends any[] = any[], R = undefined>(): {
    (...args: A): R;
    calls: { args: A }[];
  };
}