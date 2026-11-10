/** Look of a seated 3D avatar: body and skin colours, an accent, and one accessory. */
export type AvatarStyle = {
  body: string;
  skin: string;
  accent: string;
  accessory: 'tophat' | 'shades' | 'crown' | 'headphones' | 'beanie' | 'visor';
};
