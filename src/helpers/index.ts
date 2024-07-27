import { convertFileSrc } from "@tauri-apps/api/tauri";
import { parseBlob, selectCover } from "music-metadata";
import { Song } from "../types";

export function uint8ArrayToBase64(uint8Array: Uint8Array) {
  let binaryString = "";
  for (let i = 0; i < uint8Array.length; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }
  return window.btoa(binaryString);
}

export async function getMusicMetadata(path: string){

    let cover = null

    const url = convertFileSrc(path)

    const data = await fetch(url)

    const blob = await data.blob()

    const metadata = (await parseBlob(blob)).common

    const picture = selectCover(metadata.picture)

    if(picture) cover = `data:${picture.format};base64,${uint8ArrayToBase64(picture.data)}`

    return {
        artist: metadata.artist,
        artists: metadata.artists,
        title: metadata.title,
        cover,
        path,
        album: metadata.album,
        year: metadata.year,
    } as Song
}

/**
 * @description Replaces all the null and undefined fields in a song with "Unknown"
 * @param {Song} song Song to process
 */
export const dealWithUnknowns = (song: Song) => {

  const cleanedSong: any = {}

  Object.entries(song).forEach(([ field , value ]) => {

    if(field === 'cover' && (value === null || value === undefined)){
      cleanedSong[field] = value
      return
    }

    if(!value) cleanedSong[field] = 'Unknown'; else cleanedSong[field] = value
  })

  return cleanedSong as Song
}

/**
 * @description Checks if a song already exists in a list of songs
 * @param {Song[]} existingSongs List of songs
 * @param {Song} song Song to check against
 */
export const songAlreadyExists = (existingSongs: Song[] , song: Song) => {

  return existingSongs.find(s => s.title === song.title && s.artist === song.artist) ? true : false
}

/**
 * @description Runs the `dealWithUnknowns` and `getMusicMetadata` functions
 * @param {string} path path to mp3 file
 */
export const processSong = async (path: string) => {
    const metadata = await getMusicMetadata(path)

    return dealWithUnknowns(metadata)
}

export const parseTime = (milli: number) => {

    const floored = parseInt(milli.toFixed(0))

    let seconds = (floored % 60).toString()

    let minutes =  Math.floor(floored / 60).toString()

    let hours =  Math.floor(floored / 3600).toString()

    seconds = seconds.length <= 1 ? '0' + seconds : seconds

    minutes = hours != '0' && minutes.length <= 1 ? '0' + minutes : minutes

    hours = hours.length <= 1 ? '0' + hours : hours

    return `${!hours.startsWith('0') ? hours : ''} ${minutes} : ${seconds}`.trim()
}