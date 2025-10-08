# Story 2.3: AI Content Generator

## Story Information
- **Epic**: 2 - Content Generation Pipeline
- **Story ID**: 2.3
- **Story Points**: 8
- **Priority**: Critical
- **Status**: Draft

## Story
**As a** content manager  
**I want to** automatically generate Slovak astronomy articles from raw content using AI  
**So that** we have high-quality, SEO-optimized content for our platform  

## Acceptance Criteria
- [x] AI content generator Lambda function implemented
- [x] OpenAI API integration with proper error handling
- [x] Slovak article generation using enhanced prompts
- [x] Content validation and quality checks
- [x] Generated articles stored in DynamoDB
- [x] Image processing and optimization
- [x] Scheduled execution via EventBridge
- [x] CloudWatch monitoring and alerts

## Dev Notes
This story implements the core AI content generator that will process raw content from APOD and ESA Hubble feeds, generate Slovak articles using OpenAI GPT-4o, and store the processed articles in DynamoDB. The function should use the enhanced prompts from `objav-dna-slovenstina.md` and ensure high-quality, SEO-optimized content.

## Tasks
- [x] **Task 2.3.1**: Implement AI content generator Lambda function
- [x] **Task 2.3.2**: Add OpenAI API integration with error handling
- [x] **Task 2.3.3**: Implement Slovak article generation with enhanced prompts
- [x] **Task 2.3.4**: Add content validation and quality checks
- [x] **Task 2.3.5**: Store generated articles in DynamoDB
- [x] **Task 2.3.6**: Implement image processing and optimization
- [x] **Task 2.3.7**: Set up EventBridge scheduled rule
- [x] **Task 2.3.8**: Add CloudWatch monitoring and alerts
- [x] **Task 2.3.9**: Test end-to-end content generation

## Dev Agent Record
- **Agent Model Used**: GPT-4o
- **Debug Log References**: AI content generator testing and deployment completed successfully
- **Completion Notes**: 
  - AI content generator Lambda function fully implemented and deployed
  - OpenAI API integration working with proper error handling and retry logic
  - Slovak article generation using enhanced prompts from objav-dna-slovenstina.md
  - Content validation and quality checks implemented (word count, HTML validation, etc.)
  - Generated articles storage functionality completed
  - Image processing and optimization implemented with Sharp library
  - End-to-end testing completed successfully
  - Function successfully processes raw content and generates Slovak articles
  - OpenAI API key stored securely in Secrets Manager
  - Function handles errors gracefully and provides detailed logging
- **File List**: 
  - backend/functions/scheduled/ai-content-generator.js
  - backend/infrastructure/deploy-ai-content-generator.sh
  - backend/infrastructure/test-ai-content-generator.sh
- **Change Log**: 
  - 2024-12-01: Story created and AI content generator implemented
  - 2024-12-01: OpenAI API integration and error handling added
  - 2024-12-01: Slovak article generation with enhanced prompts implemented
  - 2024-12-01: Content validation and quality checks added
  - 2024-12-01: DynamoDB storage functionality completed
  - 2024-12-01: Image processing and optimization implemented
  - 2024-12-01: End-to-end testing completed successfully
- **Status**: Ready for Review

## Testing
- [x] Test OpenAI API connectivity
- [x] Verify Slovak article generation
- [x] Test content validation logic
- [x] Test DynamoDB storage
- [x] Validate image processing
- [x] Test error handling scenarios
- [x] Verify scheduled execution

## Dependencies
- Lambda function infrastructure (Story 1.4)
- DynamoDB tables (Story 1.2)
- S3 buckets (Story 1.3)
- Secrets Manager for OpenAI API key
- Raw content from APOD and ESA fetchers (Stories 2.1, 2.2)
