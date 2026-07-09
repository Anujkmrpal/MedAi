# MedAi SDK Proposal

## Vision
MedAi SDK is a private, offline medical report understanding tool designed for client-facing products. It helps users upload a medical document, validate that it looks like a medical report, extract key information, and present that information in simple language.

## Core value
The SDK is not a doctor and it does not pretend to be one. Its purpose is to make medical documents easier to understand for users in plain language, while keeping the experience safe, controlled, and explainable.

## What the SDK should do
- Accept medical report files such as images or text-based documents
- Identify whether the uploaded content is medical or unrelated
- Extract useful values such as test names, measurements, dates, and units
- Generate simplified explanations in English, Hindi, or Punjabi
- Show a cautious safety note rather than making unsupported medical claims

## Recommended MVP
1. Upload a report
2. Detect whether it is medical
3. Extract a small set of important fields
4. Replace jargon with simple explanation
5. Support three languages
6. Reject irrelevant content clearly

## Technical direction
- Web-first SDK using TypeScript
- Local processing where possible to avoid any hosted API dependency
- Lightweight OCR and parsing logic for document understanding
- Rule-based validation first, with AI used only for explanation and translation

## Client-facing positioning
This solution should be sold as:
- Offline and private
- Easy to embed into an existing app
- Helpful for multilingual patient understanding
- Safe by design and conservative in medical claims

## First milestone
Build a polished demo that shows:
- upload experience
- medical classification
- extracted fields
- simple multilingual summary
- clear safety messaging

## Next steps
- Narrow the supported report types to a few strong categories
- Build the first local SDK package
- Prepare a demo app for presentation
- Validate the user experience with real sample reports
