class QuoteView {
  constructor(outputId) {
    this.outputEl = document.getElementById(outputId);
  }

  updateQuoteDisplay(price) {
    this.outputEl.textContent = `Total: $${price}`;
  }
}
