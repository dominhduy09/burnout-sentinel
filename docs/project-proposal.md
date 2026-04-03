# Burnout Sentinel: Full Project Proposal

## Title

Burnout Sentinel: An Early Warning System for Student Burnout Using Workload and Recovery Indicators

## Abstract

Students in high-demand programs often manage a heavy weekly workload that includes classes, labs, clinical rotations, exams, assignments, and personal responsibilities. When these demands build up, students may experience high stress, poor sleep, and burnout. Traditional planners help track tasks, but they do not help students understand when their workload becomes unhealthy. This project proposes the development of Burnout Sentinel, an early warning system designed to estimate weekly burnout risk and offer personalized workload-management suggestions. Using machine learning and student-reported workload indicators, the system will identify patterns associated with overload and provide recommendations such as adjusting study timing, spreading tasks more evenly, and protecting recovery time. The goal of this project is to create a practical tool that supports student well-being while improving time management and academic sustainability.

## Introduction

Students in high-demand academic programs often face some of the most demanding schedules on campus. In many cases, they must balance more than 20 tasks per week, including coursework, labs, clinical preparation, exams, projects, and personal obligations. This constant pressure can make it difficult to maintain healthy routines, increasing the risk of stress and burnout.

Burnout is more than just feeling busy. It can affect motivation, concentration, emotional well-being, and academic performance. For students in rigorous healthcare-related fields, burnout may also impact confidence and long-term success. Although students commonly use calendars, to-do lists, and planning apps, most tools focus only on productivity. They do not evaluate whether a student's schedule is realistic or healthy.

This project aims to address that gap by building a planner that does more than organize tasks. It will also help students recognize overload early and make more balanced decisions about their time.

## Problem Statement

Students in demanding academic environments often experience intense workloads that contribute to stress, fatigue, and burnout. Existing planning tools do not provide burnout awareness, risk prediction, or personalized wellness-oriented planning support. As a result, students may continue overloading themselves without realizing the impact until their stress becomes severe.

## Purpose of the Study

The purpose of this project is to design and evaluate a smart planner that helps students manage heavy workloads by predicting burnout risk and offering practical planning suggestions. This tool is intended to support healthier academic habits and encourage earlier intervention before burnout worsens.

## Research Question

Can a machine learning-supported planning tool help students identify overload and reduce burnout risk by providing personalized weekly planning recommendations?

## Hypothesis

Students with higher task volume, greater time demands, reduced sleep, and limited recovery time will show higher burnout risk, and a planning tool that predicts overload and suggests healthier scheduling changes can improve workload awareness and time-management decisions.

## Objectives

1. Design a planner tailored to the weekly demands of students in high-load academic environments.
2. Develop a model that estimates burnout risk using workload and wellness-related inputs.
3. Provide personalized recommendations to help students rebalance their schedules.
4. Evaluate whether the tool is useful, understandable, and relevant to student needs.

## Proposed Solution

The proposed solution is Burnout Sentinel, a digital tool that allows students to enter and manage weekly responsibilities while receiving feedback about workload intensity. Instead of functioning like a normal to-do list, the planner will estimate whether a student's week appears balanced or overloaded.

The system will include two main intelligent components:

- A machine learning model that predicts burnout or stress risk based on workload patterns.
- An optional LLM-based recommendation feature that turns the risk output into simple, personalized advice.

For example, if a student has several exams, long clinical hours, and poor sleep in the same week, the system may flag that week as high risk and recommend starting assignments earlier, breaking large tasks into smaller parts, or reserving time for rest and recovery.

## Key Features

- Weekly planner for classes, clinicals, exams, assignments, and personal tasks
- Burnout risk score based on entered workload and wellness data
- Alerts for overloaded weeks
- Personalized suggestions for task distribution and recovery planning
- Dashboard showing workload trends across the week
- Simple wellness prompts related to sleep, breaks, and time balance

## Methodology

### 1. Project Design

This project will follow a design-and-evaluation approach. A prototype web-based planner will be built for students in demanding academic settings. The system will collect or simulate student workload inputs and use them to estimate burnout risk.

### 2. Data Inputs

Possible model inputs may include:

- Number of tasks in a week
- Estimated hours required
- Number of exams or major deadlines
- Clinical or lab hours
- Hours of sleep per night
- Self-reported stress level
- Amount of free or recovery time

These inputs can be gathered through:

- student surveys
- sample planning scenarios
- pilot user testing
- synthetic prototype data for early development

### 3. Machine Learning Component

A simple machine learning model such as logistic regression, decision tree, or random forest can be used to classify weekly burnout risk as low, medium, or high. The goal is not clinical diagnosis, but early identification of overloaded patterns.

### 4. LLM Component

An LLM can be used to generate personalized planner guidance in plain language. For example:

- "Your Wednesday and Thursday are heavily overloaded."
- "Start your clinical prep earlier in the week."
- "This schedule leaves little time for sleep and recovery."

### 5. Prototype Development

The planner can be developed as a web application with an input form, dashboard, risk score, and recommendation panel.

### 6. Evaluation

The project can be evaluated in two ways:

- Model evaluation: check whether the system correctly identifies overloaded schedules
- User evaluation: ask students whether the planner is useful, clear, and relevant

Possible measures include:

- prediction accuracy
- usability feedback
- perceived usefulness
- willingness to use the tool weekly

## Target Population

The target population is undergraduate students at UAB who are enrolled in high-demand academic programs, including health-related disciplines. This group is appropriate because they often experience compressed schedules, high academic expectations, and significant stress from coursework, labs, clinical requirements, and external responsibilities.

## Significance of the Study

This project is significant because it combines computer science, student wellness, and public health into a practical intervention. Rather than only measuring burnout after it happens, the project focuses on prevention. It also highlights how AI and machine learning can be used responsibly to support student well-being in real-life settings.

If successful, this project could lead to:

- better time-management awareness
- earlier recognition of overload
- healthier study habits
- a more supportive academic experience for high-stress student populations

## Ethical Considerations

This tool is not intended to diagnose mental health conditions or replace professional counseling or medical care. It is designed only as a planning and support tool. Any student testing or survey collection should protect privacy, use anonymous data when possible, and follow faculty guidance for ethical research practices.

## Expected Outcomes

The expected outcome is a working prototype that demonstrates how a smart planner can identify unhealthy workload patterns and give meaningful scheduling support. It is expected that students and reviewers will find the tool more helpful than a standard planner because it addresses both productivity and wellness.

## Conclusion

Burnout Sentinel addresses a real and important challenge faced by students in demanding academic environments: managing overwhelming workloads without sacrificing health and well-being. By combining planning features with machine learning-based burnout risk detection, this project offers a practical and innovative solution for student support. It is both technically meaningful and socially relevant, making it a strong fit for undergraduate research and Expo presentation.
