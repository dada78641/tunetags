// @dada78641/tunetags <https://github.com/dada78641/tunetags>
// © MIT license

import type {IAudioMetadata, ICommonTagsResult, IFormat} from 'music-metadata'

/** Types for our picked tag lists. */
export type TTFormatKeys = 'container' | 'codec' | 'duration' | 'sampleRate' | 'bitsPerSample' | 'numberOfChannels' | 'lossless'
export type TTCommonKeys = 'title' | 'album' | 'artists' | 'albumartist' | 'genre' | 'year' | 'track' | 'disk' | 'replaygain_album_gain' | 'replaygain_album_peak' | 'replaygain_track_gain' | 'replaygain_track_peak'
export type TTFormatTags = Partial<Pick<IFormat, TTFormatKeys>>
export type TTCommonTags = Partial<Pick<ICommonTagsResult, TTCommonKeys>> & {
  stars: number | null
}

/** Native tags; e.g. "vorbis", "iTunes", etc. */
export type TTNativeTag = {id: string, value: string, type: string}

/** Full result. */
export type TTFileTags = {
  metadata: TTCommonTags
  format: TTFormatTags
}

export type {IAudioMetadata, ICommonTagsResult, IFormat}
