export interface ICodeBlock {
    id: string;
    type: BlockType;
    code: string;
    dependencies?: IBlockDependency[];
    complexity: number;
    tags: string[];
    description?: string;
}

export enum BlockType {
    VARIABLE = 'variable',
    FUNCTION = 'function',
    BINDING = 'binding',
    TIMER = 'timer',
    PROMISE = 'promise',
    LOOP = 'loop',
    CONSOLE = 'console',
}

export interface IBlockDependency {
    blockId: string;
    type: 'requires' | 'conflicts';
}

export interface ICodeChallenge {
    id: string;
    code: string;
    blocks: string[];
    output: string;
    difficulty: number;
}

export interface IExecutionResult {
    success: boolean;
    logs?: string[];
    error?: string;
}