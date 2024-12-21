const getFeedContent = (doc) => {
  const title = doc.querySelector('title');
  const description = doc.querySelector('description');

  return { title: title.textContent, description: description.textContent };
};

const getPostsContent = (doc) => {
  const titles = doc.querySelectorAll('item > title');
  const links = doc.querySelectorAll('item > link');
  const descriptions = doc.querySelectorAll('item > description');

  const titlesArray = Array.from(titles);
  const linksArray = Array.from(links);
  const descriptionsArray = Array.from(descriptions);

  const postsContentArray = titlesArray.map((title, i) => {
    const content = {
      title: title.textContent,
      link: linksArray[i].textContent,
      description: descriptionsArray[i].textContent,
    };
    return content;
  });

  return postsContentArray;
};

export default (data, type, contentType, parser = new DOMParser()) => {
  const parsedData = parser.parseFromString(data, type);
  const errorElement = parsedData.querySelector('parsererror');
  if (errorElement) {
    throw new Error('invalidRSS');
  } else {
    switch (contentType) {
      case ('feedContent'):
        return getFeedContent(parsedData);
      case ('postsContent'):
        return getPostsContent(parsedData);
      default:
        throw new Error('unknown content type');
    }
  }
};
