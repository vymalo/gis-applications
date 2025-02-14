declare global {
    namespace PrismaJson {
        type AppJsonType = string | Record<string, AppJsonType>;
    }
}

declare module '*.md' {
    const content: string;
    export default content;
}