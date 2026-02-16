// @dada78641/tunetags <https://github.com/dada78641/tunetags>
// © MIT license

import pick from 'lodash.pick'
import {parseFile} from 'music-metadata'
import type {TTFileTags, TTFormatTags, TTCommonTags, TTNativeTag, TTNativeTags} from '../types.ts'
import type {IAudioMetadata, ICommonTagsResult, IFormat} from 'music-metadata'

/** File metadata tags we're primarily interested in. */
const COMMON_TAGS = [
  'title',
  'album',
  'artists',
  'albumartist',
  'genre',
  'year',
  'track',
  'disk',
  'grouping',
  'replaygain_album_gain',
  'replaygain_album_peak',
  'replaygain_track_gain',
  'replaygain_track_peak',
]

/** Format tags we're primarily interested in. */
const FORMAT_TAGS = [
  'container',
  'codec',
  'duration',
  'sampleRate',
  'bitsPerSample',
  'numberOfChannels',
  'lossless',
]

/**
 * Merges together all native tag types into a single list.
 */
function mergeNativeTagTypes(nativeTagTypes: IAudioMetadata['native']): TTNativeTags {
  const combinedTags = []
  for (const [type, tags] of Object.entries(nativeTagTypes)) {
    for (const tag of tags) {
      combinedTags.push([tag.id, {id: tag.id, value: String(tag.value), type}])
    }
  }
  return Object.fromEntries(combinedTags)
}

/**
 * Picks one of a number of native tags, or the fallback value.
 */
function pickNativeTagAlternative<T = any>(nativeTags: TTNativeTags, keys: string[], fallback: T): string | T {
  for (const key of keys) {
    const tag = nativeTags[key]
    if (tag == null || tag?.value == null) {
      continue
    }
    return tag.value
  }
  return fallback
}

/**
 * Runs the input file through music-metadata and returns its result.
 */
async function getMusicMetadataTags(filepath: string): Promise<IAudioMetadata> {
  return parseFile(filepath)
}

/**
 * Returns a single stars tag.
 * 
 * This is the rating value, converted into a number 1-5, or null if not set.
 * 
 * We used to have a weird hack for this, but now it works exactly as expected
 * right out of the box using music-metadata.
 */
function pickStarsTag(commonTags: ICommonTagsResult, formatTags: IFormat): TTCommonTags['stars'] {
  const ratings = commonTags.rating
  if (ratings == null || (Array.isArray(ratings) && ratings.length === 0) || !Array.isArray(ratings)) {
    return null
  }
  // The rating is always an array. We just don't support multiple ratings,
  // so we'll just pick the first one.
  const rating = ratings[0]
  if (rating.rating == null) {
    return null
  }
  // The rating will always be a float 0-1, with 1 being 5 stars.
  // The rating is inconsistent; .mp3 files rated in Winamp have a different scale,
  // but we can identify them by the source.
  if (rating.source === 'rating@winamp.com') {
    // This is an .mp3 file.
    return Math.min(Math.round(rating.rating * 4) + 1, 5)
  }
  // Here's another special exception, for .opus files.
  // We handle the rating value in a way that's consistent with the Winamp Media Library.
  if (formatTags.codec === 'Opus') {
    // The rating is between 0.01 and 0.05.
    return Math.min(Math.round(rating.rating * 100), 5)
  }

  return Math.min(Math.round(rating.rating * 5), 5)
}

/**
 * Returns a simplified subset of common tags.
 * 
 * These are the actual metadata key/value tags, such as artist, title, album, etc.
 */
function pickCommonTags(commonTags: ICommonTagsResult, formatTags: IFormat, nativeTagTypes: IAudioMetadata['native']): TTCommonTags {
  const nativeTags = mergeNativeTagTypes(nativeTagTypes)
  // Ensure there's an "artists" array.
  if (!commonTags.artists && commonTags.artist) {
    commonTags.artists = [commonTags.artist]
  }
  // Ensure there's an "albumartist" value, which must be a single string value.
  if (!commonTags.albumartist && commonTags.artist) {
    commonTags.albumartist = commonTags.artist
  }
  // Note: technically commonTags.albumartist should always be a single string value already,
  // but apparently it's sometimes an array of strings instead in practice.
  if (Array.isArray(commonTags.albumartist)) {
    commonTags.albumartist = commonTags.albumartist[0]
  }
  // Use CATEGORY and CONTENTGROUP if they exist and there is no commonTags.grouping value.
  // This should allow opus/ogg files to properly have a grouping.
  if (!commonTags.grouping && nativeTags['CATEGORY'] || nativeTags['CONTENTGROUP']) {
    commonTags.grouping = pickNativeTagAlternative<undefined>(nativeTags, ['CATEGORY', 'CONTENTGROUP'], undefined)
  }
  // "rating" is an interesting one. Files can have multiple ratings, from multiple sources.
  // This library always collapses them into a single tag value 1-5, named "stars".
  const stars = pickStarsTag(commonTags, formatTags)
  return {...pick(commonTags, COMMON_TAGS), stars}
}

/**
 * Returns a simplified subset of format tags.
 * 
 * These relate to the physical audio data itself, such as audio duration, codec, sample rate, etc.
 */
function pickFormatTags(formatTags: IFormat): TTFormatTags {
  return pick(formatTags ?? {}, FORMAT_TAGS)
}

/**
 * Parses the file's tags and returns a subset of them.
 */
export async function parseFileTags(filepath: string): Promise<TTFileTags> {
  const data = await getMusicMetadataTags(filepath)
  const common = pickCommonTags(data.common, data.format, data.native)
  const format = pickFormatTags(data.format)
  return {
    metadata: common,
    format
  }
}
