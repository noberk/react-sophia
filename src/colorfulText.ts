import { ElementOf, tuple } from './types';

export const PresetStatusColorTypes = tuple('success', 'processing', 'error', 'default', 'warning');
// eslint-disable-next-line import/prefer-default-export
export const PresetColorTypes = tuple(
    'pink',
    'red',
    'yellow',
    'orange',
    'cyan',
    'green',
    'blue',
    'purple',
    'geekblue',
    'magenta',
    'volcano',
    'gold',
    'lime',
    'violet',
);

export type PresetColorType = ElementOf<typeof PresetColorTypes>;
export type PresetStatusColorType = ElementOf<typeof PresetStatusColorTypes>;
