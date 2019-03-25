var attachShadowOverrideInUse = false;
const tagStyles = {};

if (!attachShadowOverrideInUse) {
  attachShadowOverrideInUse = true;
  var originalAttachShadow = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function() {
    var shadowRoot = originalAttachShadow.apply(this, [].slice.call(arguments));
    const upperTag = this.tagName.toUpperCase();
    const styles = tagStyles[upperTag];
    if (styles) {
      console.log("Applying styles for new shadow for " + this.outerHTML);
      shadowRoot.adoptedStyleSheets = [
        ...shadowRoot.adoptedStyleSheets,
        ...styles
      ];
    }
    return shadowRoot;
  };
}
const addToExistingElements = (tag, sheet) => {
  // Style all current elements
  const uniqueElements = getElements(tag);
  uniqueElements.forEach(element => {
    if (element.shadowRoot) {
      console.log("Applying styles for existing shadow for " + element.outerHTML);
      element.shadowRoot.adoptedStyleSheets = [
        ...element.shadowRoot.adoptedStyleSheets,
        sheet
      ];
    }
  });
};
const removeFromExistingElements = (tag, sheet) => {
  // Style all current elements
  const uniqueElements = getElements(tag);
  uniqueElements.forEach(element => {
    if (element.shadowRoot) {
      console.log("Removing styles for existing shadow for " + element.outerHTML);
      element.shadowRoot.adoptedStyleSheets = element.shadowRoot.adoptedStyleSheets.filter(
        s => s != sheet
      );
    }
  });
};

export const styleAll = (tag, css) => {
  const upperTag = tag.toUpperCase();
  if (!tagStyles[upperTag]) {
    tagStyles[upperTag] = [];
  }
  const styleSheet = new CSSStyleSheet();
  styleSheet.replace(css).then(() => tagStyles[upperTag].push(styleSheet));
  addToExistingElements(tag, styleSheet);
  return {
    remove: () => {
      removeFromExistingElements(tag, styleSheet);
    }
  };
};

const getElements = (tag, context) => {
  if (!context) {
    context = document.body;
  }
  var result = [];
  getElementsInside(context, tag.toUpperCase(), result);
  return result.filter((v, i, a) => a.indexOf(v) === i);
};

const getElementsInside = (context, tag, result) => {
  if (!context) return;

  for (var i = 0; i < context.children.length; i++) {
    var child = context.children[i];
    if (child.tagName.toUpperCase() == tag) {
      result.push(child);
    }

    if (child.shadowRoot) {
      getElementsInside(child.shadowRoot, tag, result);
    }
    getElementsInside(child, tag, result);
  }
};
