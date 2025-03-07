import { useCallback, useState } from "react";
import { ICodeChallenge } from "../types";
import { executeCode } from "../services/codeExecutionService";

interface IUseCodeExecutionReturn {
    challenge: ICodeChallenge | null;
    userAnswer: string;
    setUserAnswer: (answer: string) => void;
    actualOutput: string | null;
    isCorrect: boolean | null;
    isLoading: boolean;
    executionError: string | null;
    generateNewChallenge: () => void;
    runCodeInBrowser: () => Promise<void>;
}

export const useCodeExecution = (): IUseCodeExecutionReturn => {
    const [challenge, setChallenge] = useState<ICodeChallenge | null>(null);
    const [userAnswer, setUserAnswer] = useState<string>('');
    const [actualOutput, setActualOutput] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [executionError, setExecutionError] = useState<string | null>(null);

    const generateNewChallenge = useCallback(async () => {
        setIsLoading(true);
        setUserAnswer('');
        setActualOutput(null);
        setIsCorrect(null);
        setExecutionError(null);

        try {
            const newChallenge = generateCodeChallenge();

            const result = await executeCode(newChallenge.code);

            if (result.success) {
                const output = (result.logs || []).join('\n');
                newChallenge.output = output;
                setActualOutput(output);
                setChallenge(newChallenge);
            } else {
                setExecutionError(`Ошибка при генерации задачи: ${result.error}`);
            }
        } catch (error) {
            setExecutionError(`Ошибка при генерации задачи: ${(error as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const checkAnswer = useCallback(() => {
        if (!userAnswer.trim() || !actualOutput) return;

        const normalizedUserAnswer = userAnswer.trim();
        const normalizedActualOutput = actualOutput.trim();

        setIsCorrect(normalizedUserAnswer === normalizedActualOutput);
    }, [userAnswer, actualOutput]);

    const runCodeInBrowser = useCallback(async () => {
        if (!challenge) return;

        setIsLoading(true);
        try {
            const result = await executeCode(challenge.code);

            if (result.success) {
                const output = (result.logs || []).join('\n');
                setActualOutput(output);

                setChallenge(prevChallenge => {
                    if (prevChallenge) {
                        return {
                            ...prevChallenge,
                            output
                        };
                    }
                    return prevChallenge;
                });
            } else {
                setExecutionError(`Ошибка при выполнении кода: ${result.error}`);
            }
        } catch (error) {
            setExecutionError(`Ошибка при выполнении кода: ${(error as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    }, [challenge]);

    return {
        challenge,
        userAnswer,
        setUserAnswer,
        actualOutput,
        isCorrect,
        isLoading,
        executionError,
        generateNewChallenge,
        checkAnswer,
        runCodeInBrowser
    };
}