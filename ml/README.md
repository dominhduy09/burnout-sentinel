# ML Notes

This folder is reserved for future machine learning work.

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

