import { writeFile } from "fs/promises";
import Anthropic from "@anthropic-ai/sdk";

export type Srt = {
    fileName: string;
    content: string;
};

export async function generateCleanSrt(
    transcript: Transcript[],
    srt: Srt[],
    secrets: VideoSecrets
) {
    console.log(`🎬 Starting SRT cleaning process for ${srt.length} files`);
    const BATCH_SIZE = 5;
    const BATCH_DELAY = 5000;

    for (
        let batchStart = 0;
        batchStart < transcript.length;
        batchStart += BATCH_SIZE
    ) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE, transcript.length);
        console.log(
            `\n📦 Processing batch ${
                Math.floor(batchStart / BATCH_SIZE) + 1
            }/${Math.ceil(transcript.length / BATCH_SIZE)}`
        );

        // Process current batch
        for (let i = batchStart; i < batchEnd; i++) {
            console.log(`\n📝 Processing SRT ${i + 1}/${transcript.length}`);
            console.log(`🎯 File: ${srt[i].fileName}`);

            try {
                const response = await cleanSrt(
                    transcript[i].text,
                    srt[i].content,
                    i,
                    secrets
                );

                if (response) {
                    console.log(
                        `✍️ Writing cleaned SRT to: ${srt[i].fileName}`
                    );
                    await writeFile(
                        `public/srt/${srt[i].fileName}`,
                        response.content ?? "",
                        "utf8"
                    );
                    console.log(
                        `✅ Successfully processed SRT ${i + 1}/${
                            transcript.length
                        }`
                    );
                }
            } catch (error) {
                console.error(
                    `❌ Error processing SRT ${i + 1}/${transcript.length}:`,
                    error
                );
                throw error;
            }
        }

        // If there are more batches to process, wait
        if (batchEnd < transcript.length) {
            console.log(
                `\n⏳ Batch complete. Waiting 30 seconds before processing next batch...`
            );
            await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
        }
    }

    console.log(`\n🎉 Completed processing all ${srt.length} SRT files`);
}

async function cleanSrt(
    transcript: string,
    srt: string,
    i: number,
    secrets: VideoSecrets
) {
    const anthropic = new Anthropic({
        apiKey: secrets.CLAUDE_API_KEY,
    });
    const completion = await anthropic.messages.create({
        messages: [
            {
                role: "user",
                content: `The first item I will give you is the correct text, and the next will be the SRT generated from this text which is not totally accurate. Sometimes the srt files just doesn't have words so if this is the case add the missing words to the SRT file which are present in the transcript. Based on the accurate transcript, and the possibly inaccurate SRT file, return the SRT text corrected for inaccurate spelling and such. Make sure you keep the format and the times the same.

				note: ONLY RETURN THE SRT FILE TEXT, NOTHING ELSE, NO COMMENTS, NO PROMPT, NO EXPLANATIONS, JUST THE SRT FILE TEXT BECAUSE I AM DIRECTLY USING THIS OUTPUT YOU GENERATED.
                            
                            transcript: 
                            ${transcript}
                            
                            srt file text: 
                            ${srt}`,
            },
        ],
        model: "claude-3-5-sonnet-latest",
        max_tokens: 8192,
    });

    const responseContent = (completion.content[0] as any).text;
    return { content: responseContent, i };
}
