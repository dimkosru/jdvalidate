import {JediValidate} from "jedi-validate";

declare module "jedi-validate" {
    class JediValidate {
        public collect(params?: string | Array<string>): object;
        public addMethod(rule: string, func: Function, message: string): void;
        public addToDictionary(sourceText: string, translatedText: string, language: string): void;
    }
}
