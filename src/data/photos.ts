/**
 * Every photo on the site, with alt text, caption, credit and crop focus.
 *
 * PLACEHOLDER: replace with the club's real photo. All six are free-license stand-in
 * photos (Unsplash / Pexels) used until the club has its own photography. Credits below
 * are carried from dinkwell-photos/CREDITS.md and shown on the page.
 */
import type { ImageMetadata } from 'astro';
import goldenHourLunge from '../assets/images/courts/golden-hour-lunge.jpg';
import indoorRally from '../assets/images/courts/indoor-rally-green-wall.jpg';
import coveredCourtVolley from '../assets/images/courts/covered-court-volley.jpg';
import coveredCourtReady from '../assets/images/gallery/covered-court-ready.jpg';
import outdoorDoubles from '../assets/images/gallery/outdoor-doubles.jpg';
import playerWithPaddle from '../assets/images/gallery/player-with-paddle.jpg';

export interface Photo {
  src: ImageMetadata;
  alt: string;
  caption: string;
  credit: string;
  creditUrl: string;
  /** CSS object-position for crops */
  focus: string;
}

export const photos = {
  // PLACEHOLDER: replace with the club's real photo
  'golden-hour-lunge': {
    src: goldenHourLunge,
    alt: 'A player lunges low for a forehand at golden hour, the ball just off the court surface',
    caption: 'Low and late: a forehand off the bounce.',
    credit: 'eedgar ivann / Unsplash',
    creditUrl: 'https://unsplash.com/photos/man-playing-pickleball-on-a-court-tn98VMfWXEs',
    focus: '50% 74%',
  },
  // PLACEHOLDER: replace with the club's real photo
  'indoor-rally-green-wall': {
    src: indoorRally,
    alt: 'A player reaches for a forehand volley on an indoor pickleball court with a deep green wall',
    caption: 'Indoor rally, out of the weather.',
    credit: 'HONG SON / Pexels',
    creditUrl: 'https://www.pexels.com/photo/woman-playing-pickleball-in-indoor-court-32975182/',
    focus: '60% 50%',
  },
  // PLACEHOLDER: replace with the club's real photo
  'covered-court-volley': {
    src: coveredCourtVolley,
    alt: 'A player volleys at the net on a sunlit covered pickleball court',
    caption: 'Volley at the kitchen line, under the roof.',
    credit: 'Anh Lee / Pexels',
    creditUrl: 'https://www.pexels.com/photo/young-man-playing-pickleball-indoors-in-hanoi-29439337/',
    focus: '50% 40%',
  },
  // PLACEHOLDER: replace with the club's real photo
  'covered-court-ready': {
    src: coveredCourtReady,
    alt: 'A player watches the ball onto his paddle at the net on a covered court',
    caption: 'Eyes on the ball, paddle up.',
    credit: 'Anh Lee / Pexels',
    creditUrl: 'https://www.pexels.com/photo/young-man-playing-pickleball-in-hanoi-court-29439333/',
    focus: '40% 55%',
  },
  // PLACEHOLDER: replace with the club's real photo
  'outdoor-doubles': {
    src: outdoorDoubles,
    alt: 'Doubles partners at the net, one reaching low for a ball in front of a blue windscreen',
    caption: 'Doubles at the net.',
    credit: 'Venti Views / Unsplash',
    creditUrl: 'https://unsplash.com/photos/people-play-pickleball-on-an-outdoor-court-WFpPbZ6OFk4',
    focus: '55% 70%',
  },
  // PLACEHOLDER: replace with the club's real photo
  'player-with-paddle': {
    src: playerWithPaddle,
    alt: 'A smiling player raises his paddle on court between games',
    caption: 'Between games.',
    credit: 'Sanket Mishra / Unsplash',
    creditUrl: 'https://unsplash.com/photos/a-smiling-man-holds-a-pickleball-paddle-on-court-uZ6MA0W774U',
    focus: '55% 35%',
  },
} satisfies Record<string, Photo>;

export type PhotoId = keyof typeof photos;

export const getPhoto = (id: string): Photo => {
  const photo = (photos as Record<string, Photo>)[id];
  if (!photo) throw new Error(`Unknown photo id "${id}" (see src/data/photos.ts)`);
  return photo;
};

/** Gallery order. */
export const galleryOrder: PhotoId[] = [
  'indoor-rally-green-wall',
  'golden-hour-lunge',
  'player-with-paddle',
  'covered-court-volley',
  'outdoor-doubles',
  'covered-court-ready',
];
