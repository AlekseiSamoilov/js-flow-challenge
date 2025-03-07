import React from 'react'
import { useCodeExecution } from '../hooks/useCodeExecution'

const CodeChallengeApp: React.FC = () => {

    const {
        challenge,
        userAnswer,
        setUserAnswer,
        actualOption,
        isCorrect,
        isLoading,
        executionError,
        generateNewChallenge,
        checkAnswer,
        runCodeInBrowser
    } = useCodeExecution();
    return (
        <div>

        </div>
    )
}

export default CodeChallengeApp: React.FC
