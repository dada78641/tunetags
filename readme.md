[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/) [![MIT license](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)

# @dada78641/tunetags

Library for obtaining tag information from music files.

This is mostly a wrapper around the [music-metadata](https://github.com/borewit/music-metadata) library, but it adds a few opinionated choices that work well for my specific use case.

Designed for [tuneserver](https://github.com/dada78641/tuneserver).

One particular quirk of this library is that it reads the .opus `rating` value differently than is arguably standard (even though it's not properly defined in a standard). It reads the value consistently with how the Winamp Media Library interprets the value (as 0.01 for 1 star, 0.02 for 2 stars, etc).

## License

MIT licensed.
