export default interface Activity {
    params:any;
    // data: Array<object>;
    content: any;
    container: HTMLDivElement;
    get(): void;
    list(): void;
}