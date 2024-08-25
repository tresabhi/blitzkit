import { youtubers } from './constants/youtubers';
import { decodeYouTubeId } from './core/youtube/decodeYouTubeId';
import { encodeYouTubeId } from './core/youtube/encodeYouTubeId';

youtubers.forEach((yt) => {
  console.log(yt.id, decodeYouTubeId(encodeYouTubeId(yt.id)));
});
