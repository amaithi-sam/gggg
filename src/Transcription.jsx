import React, { useEffect, useState } from 'react';
import { AnalyzeBatchAction, AzureKeyCredential, TextAnalysisClient } from "@azure/ai-language-text";

const AzureTextSummarization = (props) => {
    const { documents, apiKey, endpoint, setcanTranscribe, setLoading, setIsStopButtonDisabled, setIsStartButtonDisabled } = props;
    const [summaries, setSummaries] = useState([]);

    useEffect(() => {
        const performSummarization = async () => {
            try {
                console.log("== Extractive Summarization Sample ==");

                const client = new TextAnalysisClient(endpoint, new AzureKeyCredential(apiKey));
                const actions = [
                    {
                        kind: "ExtractiveSummarization",
                        maxSentenceCount: 10,
                    },
                ];

                const poller = await client.beginAnalyzeBatch(actions, documents, "en");

                poller.onProgress(() => {
                    console.log(
                        `Last time the operation was updated was on: ${poller.getOperationState().modifiedOn}`
                    );
                });
                console.log(`The operation was created on ${poller.getOperationState().createdOn}`);
                console.log(`The operation results will expire on ${poller.getOperationState().expiresOn}`);

                const results = await poller.pollUntilDone();

                const extractedSummaries = [];

                for await (const actionResult of results) {
                    if (actionResult.kind !== "ExtractiveSummarization") {
                        throw new Error(`Expected extractive summarization results but got: ${actionResult.kind}`);
                    }
                    if (actionResult.error) {
                        const { code, message } = actionResult.error;
                        throw new Error(`Unexpected error (${code}): ${message}`);
                    }
                    for (const result of actionResult.results) {
                        console.log(`- Document ${result.id}`);
                        if (result.error) {
                            const { code, message } = result.error;
                            throw new Error(`Unexpected error (${code}): ${message}`);
                        }
                        console.log("Summary:");
                        // console.log(result.sentences.text)
                        const summaryText = result.sentences.map((sentence) => sentence.text).join("\n");
                        extractedSummaries.push({ id: result.id, summary: summaryText });

                        console.log(result.sentences.map((sentence) => sentence.text).join("\n"));
                    }
                }
                setSummaries(extractedSummaries);
            } catch (error) {
                console.error("Error in text summarization:", error);
            }
            // setcanTranscribe(false)
        };

        if (documents && documents.length > 0 && apiKey && endpoint) {
            performSummarization();
        }
    }, [documents, apiKey, endpoint]);

    return (
        <div>
            <h2>Text Summarization</h2>
            {summaries.map((summary) => (
                <div key={summary.id}>
                    {/* <p>{`Document ${summary.id} Summary:`}</p> */}
                    <pre>{summary.summary}</pre>
                    {/* {setcanTranscribe(false)} */}


                </div>
            ))}
            {setLoading(false)}
            {setIsStopButtonDisabled(true)}
            {setIsStartButtonDisabled(false)}
        </div>
    );
};

export default AzureTextSummarization;
