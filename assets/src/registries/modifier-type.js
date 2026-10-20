Registry.modifierTypes.add("prereq.object.exists", ObjectPrerequisite);

Registry.modifierTypes.add("prereq.meta.not", NotMetaPrerequisite);
Registry.modifierTypes.add("prereq.meta.and", AndMetaPrerequisite);
Registry.modifierTypes.add("prereq.meta.or", OrMetaPrerequisite);

Registry.modifierTypes.add("prereq.prop.exists", AbstractPropertyPrereq);
Registry.modifierTypes.add("prereq.value.equal", AbstractValuePrereq);
Registry.modifierTypes.add("prereq.value.equal.str-ci", CaseInsensitiveEqualValuePrereq);
Registry.modifierTypes.add("prereq.value.inequal", InequalValuePrereq);
Registry.modifierTypes.add("prereq.value.less", LessThanValuePrereq);
Registry.modifierTypes.add("prereq.value.greater", GreaterThanValuePrereq);

Registry.modifierTypes.add("modifier.prop.delete", PropertyModifier);
Registry.modifierTypes.add("modifier.prop.nest", PropertyNestingModifier);
Registry.modifierTypes.add("modifier.prop.copy", PropertyCopyModifier);
Registry.modifierTypes.add("modifier.value.set", AbstractValueModifier);
Registry.modifierTypes.add("modifier.value.merge", ValueMergeModifier);
Registry.modifierTypes.add("modifier.value.add", ValueAdditionModifier);
Registry.modifierTypes.add("modifier.value.subtract", ValueSubtractionModifier);
Registry.modifierTypes.add("modifier.value.multiply", ValueMultiplicationModifier);
Registry.modifierTypes.add("modifier.value.divide", ValueDivisionModifier);
