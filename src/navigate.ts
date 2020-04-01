export default function navigate(props, spa: boolean, url: string) {
  if (spa) {
    props.history.push(url);
  } else {
    const absoluteUrlRegex = new RegExp("^(?:[a-z]+:)?//", "i");
    if (!spa && !url.match(absoluteUrlRegex)) {
      //@ts-ignore
      url = window.openmrsBase + url;
    }
    window.location.href = url;
  }
}
