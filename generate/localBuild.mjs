import transcribeFunction from './transcribe.mjs';
import path from 'path';
import { exec } from 'child_process';
import { topics } from './topics.mjs';
import { rm, mkdir, unlink } from 'fs/promises';

export const PROCESS_ID = 0;

async function cleanupResources() {
	try {
		await rm(path.join('public', 'srt'), { recursive: true, force: true });
		await rm(path.join('public', 'voice'), { recursive: true, force: true });
		await unlink(path.join('public', `audio-${PROCESS_ID}.mp3`)).catch((e) =>
			console.error(e),
		);
		await unlink(path.join('src', 'tmp', 'context.tsx')).catch((e) =>
			console.error(e),
		);
		await mkdir(path.join('public', 'srt'), { recursive: true });
		await mkdir(path.join('public', 'voice'), { recursive: true });
	} catch (err) {
		console.error(`Error during cleanup: ${err}`);
	}
}

// Define valid options as enums
export const VALID_AGENTS = [
	'BARACK_OBAMA',
	'BEN_SHAPIRO',
	'JORDAN_PETERSON',
	'JOE_ROGAN',
	'DONALD_TRUMP',
	'MARK_ZUCKERBERG',
	'JOE_BIDEN',
	'LIL_YACHTY',
	'RICK_SANCHEZ',
];

export const VALID_MUSIC = [
	'WII_SHOP_CHANNEL_TRAP',
	'FLUFFING_A_DUCK',
	'MONKEYS_SPINNING_MONKEYS',
];

export const VALID_BACKGROUNDS = ['MINECRAFT', 'SUBWAY'];

/**
 * Validates the input parameters for video generation
 * @param {Object} params - The input parameters
 * @returns {Object} - Object containing validation result and error message if any
 */
export function validateParams(params) {
	const { agentA, agentB, music, background } = params;

	if (!VALID_AGENTS.includes(agentA)) {
		return { isValid: false, error: `Invalid agentA. Must be one of: ${VALID_AGENTS.join(', ')}` };
	}

	if (!VALID_AGENTS.includes(agentB)) {
		return { isValid: false, error: `Invalid agentB. Must be one of: ${VALID_AGENTS.join(', ')}` };
	}

	if (agentA === agentB) {
		return { isValid: false, error: 'agentA and agentB must be different' };
	}

	if (!VALID_MUSIC.includes(music)) {
		return { isValid: false, error: `Invalid music. Must be one of: ${VALID_MUSIC.join(', ')}` };
	}

	if (!VALID_BACKGROUNDS.includes(background)) {
		return { isValid: false, error: `Invalid background. Must be one of: ${VALID_BACKGROUNDS.join(', ')}` };
	}

	return { isValid: true };
}

/**
 * Generates a video with the specified parameters
 * @param {Object} params - The input parameters
 * @param {string} params.videoTopic - Free-form string for video topic
 * @param {string} params.agentA - First agent name
 * @param {string} params.agentB - Second agent name
 * @param {string} params.music - Background music selection
 * @param {string} params.background - Background video selection
 * @returns {Promise<void>}
 */
export async function generateVideo(params) {
	const {
		videoTopic,
		agentA,
		agentB,
		music,
		background,
		aiGeneratedImages = true,
		fps = 20,
		duration = 1, // minute
		cleanSrt = true,
		local = true,
	} = params;

	const validation = validateParams(params);
	if (!validation.isValid) {
		throw new Error(validation.error);
	}

	await transcribeFunction(
		local,
		videoTopic,
		agentA,
		agentB,
		aiGeneratedImages,
		fps,
		duration,
		background,
		music,
		cleanSrt,
	);

	exec('npm run build', async (error, stdout, stderr) => {
		if (error) {
			console.error(`exec error: ${error}`);
			return;
		}
		console.log(`stdout: ${stdout}`);
		console.error(`stderr: ${stderr}`);

		await cleanupResources();
	});
}

// Example usage (can be removed when integrating with API):
// generateVideo({
//     videoTopic: "Discussing the importance of exercise",
//     agentA: "JOE_ROGAN",
//     agentB: "JORDAN_PETERSON",
//     music: "WII_SHOP_CHANNEL_TRAP",
//     background: "MINECRAFT"
// });
