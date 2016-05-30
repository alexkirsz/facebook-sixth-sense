export default function getUserId(fbid) {
  return fbid.split(':')[1];
}
