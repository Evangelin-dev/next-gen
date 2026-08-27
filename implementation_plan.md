# Implement `is_qualified` Lead Disqualification

This plan outlines the changes needed to support disqualifying leads based on their roles and questionnaire answers.

## User Review Required

Please review the proposed backend changes and the instructions provided for the frontend AI.

## Proposed Changes

### CRM Backend (Django)

We will add a boolean field to the `Interest` model to track if a lead is qualified. This will be exposed via the API so the landing page can update it.

#### [MODIFY] [`models.py`](file:///d:/BotAgency/CRM-Bot/crm-latest/backend/apps/interests/models.py)
Add `is_qualified = models.BooleanField(default=True)` to the `Interest` model.

#### [MODIFY] [`serializers.py`](file:///d:/BotAgency/CRM-Bot/crm-latest/backend/apps/interests/serializers.py)
Add `'is_qualified'` to the `fields` of `InterestUpdateSerializer` so the frontend can update this status when they answer the final question, and ensure it's available in `InterestSerializer`.

#### [NEW] Database Migration
Run `python manage.py makemigrations` and `python manage.py migrate` to apply the database changes.

---

### Frontend Instructions (for the other AI)

Since I don't have access to the `D:\BotAgency\lp-page-video-questions\lp-video-questionnaire` directory, here is exactly what the other AI needs to do on the frontend:

1. **State Management for Qualification**: 
   Add a state variable (e.g., `const [isQualified, setIsQualified] = useState(true);`) in the main form component.

2. **Role Qualification Check (Step 1)**:
   - When the user selects a role, check if it's one of: `"Factory owner"`, `"Exporter"`, or `"Manufacturer"`.
   - If it is **NOT** one of those, set `isQualified = false`.
   - Show a popup UI (similar to the provided screenshot) informing them the program is exclusive to Factory Owners & Manufacturers. 
   - However, **allow them to continue** to the next step if they dismiss it (or just silently mark them unqualified if no block is intended). *Note: The prompt says "we can let em next cuz its fine, we just make em not qualified just dont tell em", but also says "we need to show a ui change like a popup". So show the popup, but have a "Continue anyway" or just auto-continue after showing the message, or allow them to proceed without blocking them.*

3. **Investment Question Qualification Check (Final Step)**:
   - On the final question, if they select `"Not looking to invest right now"`, set `isQualified = false`.

4. **API Submission**:
   - When making the POST or PATCH request to the CRM backend to save the `Interest` / questionnaire data, include `"is_qualified": isQualified` in the JSON payload. 

## Verification Plan

### Manual Verification
- Check the backend Django Admin or API response to ensure `is_qualified` is successfully saved when `false` is sent.
- Verify the frontend AI implements the UI popup and successfully passes the `is_qualified` payload to the backend.
