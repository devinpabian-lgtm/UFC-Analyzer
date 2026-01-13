# Data Model

This document defines the baseline entities and relationships for the UFC analyzer.

## Entities

### Fighter
Represents a single fighter and their static information.

| Field | Type | Description |
| --- | --- | --- |
| id | string (UUID) | Unique identifier. |
| name | string | Fighter name. |
| nickname | string (optional) | Optional nickname. |
| height_in | number | Height in inches. |
| reach_in | number | Reach in inches. |
| weight_class | string | E.g., Lightweight. |
| stance | string | Orthodox/Southpaw/Switch. |
| primary_style | string | e.g., Boxing, Muay Thai, BJJ. |
| team | string (optional) | Team or gym. |
| notes | string (optional) | General notes. |

### Fight
Represents a single fight for a fighter.

| Field | Type | Description |
| --- | --- | --- |
| id | string (UUID) | Unique identifier for the fight record. |
| fighter_id | string (UUID) | The subject fighter. |
| opponent_id | string (UUID) | Opponent fighter. |
| event | string | Event name. |
| date | string (YYYY-MM-DD) | Date of the event. |
| weight_class | string | Weight class at time of fight. |
| result | string | Win/Loss/Draw/NC. |
| method | string | Method of result. |
| rounds_scheduled | number | e.g., 3 or 5. |
| rounds_completed | number | e.g., 3. |
| performance | object | Subjective performance rating. |
| skill_implementation | object | Ratings for attempted skills. |
| notes | string (optional) | Notes on the fight. |

### Performance (Per Fight)

| Field | Type | Description |
| --- | --- | --- |
| score | number (0-10) | Overall performance rating. |
| confidence | number (0-1) | Optional confidence in the rating. |
| highlights | string (optional) | Notes about standout moments. |

### Skill Implementation

A subjective rating for how much the fighter **attempted** each skill during the fight.

| Field | Type | Description |
| --- | --- | --- |
| boxing | number (0-10) | Attempts to box. |
| kickboxing | number (0-10) | Attempts to kickbox. |
| wrestling | number (0-10) | Attempts to wrestle. |
| clinch | number (0-10) | Attempts to clinch. |
| grappling | number (0-10) | Attempts to grapple. |
| submissions | number (0-10) | Attempts to submit. |
| ground_striking | number (0-10) | Ground-and-pound focus. |
| footwork | number (0-10) | Movement and positioning focus. |
| notes | string (optional) | Additional context. |

## Relationships

- A **fighter** can have many **fights**.
- A **fight** references a fighter and opponent (both are fighter IDs).
- Each fight includes a single **performance** and **skill implementation** object.

## Example Data

```json
{
  "fighters": [
    {
      "id": "ftr_001",
      "name": "Jane Doe",
      "nickname": "The Hammer",
      "height_in": 67,
      "reach_in": 70,
      "weight_class": "Women’s Bantamweight",
      "stance": "Orthodox",
      "primary_style": "Muay Thai",
      "team": "Example MMA",
      "notes": "Aggressive opener, fast starter."
    }
  ],
  "fights": [
    {
      "id": "fgt_1001",
      "fighter_id": "ftr_001",
      "opponent_id": "ftr_002",
      "event": "UFC Example Night",
      "date": "2024-01-20",
      "weight_class": "Women’s Bantamweight",
      "result": "Win",
      "method": "UD",
      "rounds_scheduled": 3,
      "rounds_completed": 3,
      "performance": {
        "score": 7.5,
        "confidence": 0.8,
        "highlights": "Controlled range well, strong leg kicks."
      },
      "skill_implementation": {
        "boxing": 6,
        "kickboxing": 8,
        "wrestling": 3,
        "clinch": 4,
        "grappling": 2,
        "submissions": 1,
        "ground_striking": 2,
        "footwork": 7,
        "notes": "Used kicks early, limited takedown attempts."
      },
      "notes": "Opponent struggled with distance."
    }
  ]
}
```
