# ML Notes

This folder is reserved for future machine learning work.

The current backend already exposes an explainable scoring API, so ML work here should keep the same input/output shape when possible.

Recommended future contents:

- data cleaning notebooks
- simulated data generation scripts
- training scripts for logistic regression or random forest
- saved model artifacts
- evaluation reports

Suggested file layout:

```text
ml/
  data/
  notebooks/
  scripts/
  models/
```

For the MVP, the backend currently uses an explainable rules-based predictor so the app is easy to demo and easy to defend in Expo. Later, you can swap in a trained scikit-learn model without changing the frontend API contract.

## Suggested Workflows

- keep training notebooks separate from production code
- save raw or simulated datasets in a dedicated data folder
- export trained models with versioned filenames
- document evaluation metrics before changing the backend API contract

