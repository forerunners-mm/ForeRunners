#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate the Forerunners 2026–2029 roadmap and indicators workbook."""

from pathlib import Path

import pandas as pd


ROADMAP_DATA = {
    "Product": [
        "P1 Life Skills & Leadership",
        "P2 Livelihoods & Green Micro-Enterprise",
        "P3 Digital Literacy & Safety",
        "P4 Mental Well-being & Resilience",
        "P5 Community Inclusion & Partnerships",
        "P6 Digital M&E + Knowledge",
    ],
    "2026 Foundation Outcomes & Outputs": [
        "Outcome: Improved confidence, decision-making, and civic participation among youth/women. Outputs: 6–8 cohorts; facilitator guides; peer circles.",
        "Outcome: Initial income-generating and green activities started. Outputs: Bootcamps; starter kits; green micro-grant pilot.",
        "Outcome: Foundational digital competence and safety awareness. Outputs: Basic/advanced courses; safety protocols; device access pilots.",
        "Outcome: Increased awareness and help-seeking. Outputs: Awareness sessions; support groups; referral map.",
        "Outcome: Greater participation and inclusion in activities. Outputs: Mobilization events; inclusion guidelines; partner mapping.",
        "Outcome: Evidence-based decisions and donor reporting. Outputs: Indicator framework; simple digital database; baseline.",
    ],
    "2027 Scale & Integrate Outcomes & Outputs": [
        "Outcome: Stronger youth/women leadership in communities. Outputs: 12+ cohorts; leadership labs; community projects.",
        "Outcome: Diversified, more stable livelihoods. Outputs: SME coaching; market linkage days; green enterprise pipeline.",
        "Outcome: Expanded digital engagement for education/business. Outputs: Online entrepreneurship module; trainer pool; low-bandwidth resources.",
        "Outcome: Improved emotional resilience and coping. Outputs: Resilience coaching; facilitator training; partner MOUs.",
        "Outcome: Strengthened local networks and co-design. Outputs: Community advisory groups; participatory planning cycles.",
        "Outcome: Timely, credible data for learning and donors. Outputs: Dashboards; quarterly reviews; first impact brief.",
    ],
    "2028 Deepen & Diversify Outcomes & Outputs": [
        "Outcome: Sustained peer leadership and mentoring. Outputs: Advanced modules; alumni mentors; local leadership councils.",
        "Outcome: Eco-friendly enterprises scaling. Outputs: Advanced green tracks; supplier linkages; impact stories.",
        "Outcome: Digital income pathways growing. Outputs: Digital marketing labs; e-commerce pilots; cybersecurity refreshers.",
        "Outcome: Stronger community support ecosystems. Outputs: Peer supporter network; periodic group sessions; case management lite.",
        "Outcome: Inclusive decision-making normalized. Outputs: Local partnership MOUs; joint initiatives.",
        "Outcome: Continuous improvement cycle. Outputs: Case study library; donor-ready reports; adaptation logs.",
    ],
    "2029 Consolidate & Sustain Outcomes & Outputs": [
        "Outcome: Community-led leadership systems. Outputs: Handover playbooks; local facilitator certification.",
        "Outcome: Resilient green livelihoods institutionalized. Outputs: Revolving fund/finance partner; local business hubs.",
        "Outcome: Digitally connected communities. Outputs: Community device-sharing scheme; certified digital trainers.",
        "Outcome: Embedded well-being practices. Outputs: Community champions; sustained referral pathways; learning briefs.",
        "Outcome: Community-led governance of select components. Outputs: Handover frameworks; local stewardship committees.",
        "Outcome: Sustainable knowledge system. Outputs: Playbooks; open templates; next-strategy inputs.",
    ],
    "Key Milestones (all years)": [
        "M1: Curriculum v1 approved (Q2 2026). M2: 1,000 graduates by end-2027. M3: Alumni mentor network live (2028).",
        "M1: 100 micro-enterprises launched (2027). M2: 40% adopt green practices (2028). M3: Finance partnership signed (2029).",
        "M1: 1,500 digitally trained (2027). M2: 300 online sellers active (2028). M3: Device-sharing live (2029).",
        "M1: Referral pathway formalized (2026). M2: 50 peer supporters trained (2028). M3: Annual well-being report (2029).",
        "M1: Stakeholder matrix live (2026). M2: 10 active local partners (2028). M3: 3 community-led components (2029).",
        "M1: M&E framework + baseline (Q3 2026). M2: Dashboard v1 (Q1 2027). M3: First impact brief (Q4 2027).",
    ],
}

INDICATORS_DATA = {
    "Indicator Type": [
        "Output", "Output", "Output", "Outcome", "Outcome", "Outcome",
        "Outcome", "Outcome", "Impact", "Impact", "Impact", "Impact",
    ],
    "Indicator Name": [
        "Participants trained", "Cohorts completed", "Mentors trained", "Confidence increase",
        "Income diversification", "Green practice adoption", "Digital use for business/learning",
        "Well-being improvement", "Household income stability", "Youth/women leadership roles",
        "Green enterprise survival", "Digitally active community networks",
    ],
    "Definition": [
        "Total unique participants completing any Forerunners training",
        "Number of cohorts that finished the full curriculum",
        "Number of peer mentors/facilitators trained",
        "Share reporting higher confidence/decision-making post-training",
        "Share with 2+ income sources post-program",
        "Share of enterprises using at least one green practice",
        "Share using digital tools for income or learning",
        "Share with improved well-being scores",
        "Share reporting stable or rising household income",
        "Number in formal community leadership roles",
        "Share of green enterprises operating 12+ months",
        "Number of active digital groups/channels",
    ],
    "Data Source": [
        "Training attendance sheets", "Cohort completion logs", "Trainer records", "Pre/post surveys",
        "Follow-up surveys", "Business checklists", "Usage logs/surveys", "Well-being scales",
        "Annual review", "Community records", "Business registry", "Platform analytics",
    ],
    "Target 2027": [3000, 20, 60, 0.60, 0.35, 0.25, 0.40, 0.50, 0.55, 80, 0.60, 20],
    "Target 2028": [6000, 40, 120, 0.70, 0.45, 0.40, 0.55, 0.60, 0.65, 150, 0.70, 40],
    "Target 2029": [9000, 60, 180, 0.75, 0.55, 0.50, 0.65, 0.65, 0.70, 220, 0.75, 60],
}


def main() -> None:
    output_path = Path("docs/Forerunners_Roadmap_and_Indicators_2026-2029.xlsx")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    roadmap = pd.DataFrame(ROADMAP_DATA)
    indicators = pd.DataFrame(INDICATORS_DATA)

    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        roadmap.to_excel(writer, sheet_name="Roadmap Table", index=False)
        indicators.to_excel(writer, sheet_name="Indicators", index=False)

    print(f"Generated: {output_path}")


if __name__ == "__main__":
    main()
