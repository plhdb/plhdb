package org.nescent.plhdb.hibernate.dao;

// Generated Dec 12, 2007 11:49:54 AM by Hibernate Tools 3.2.0.CR1

import java.util.HashSet;
import java.util.Set;

/**
 * Study generated by hbm2java
 */
public class Study implements java.io.Serializable {

    private int studyOid;
    private Taxon taxon;
    private Site site;
    private String name;
    private String studyId;
    private String owners;
    private Set individuals = new HashSet(0);

    public Study() {
    }

    public Study(int studyOid, Taxon taxon, Site site, String studyId) {
	this.studyOid = studyOid;
	this.taxon = taxon;
	this.site = site;
	this.studyId = studyId;
    }

    public Study(int studyOid, Taxon taxon, Site site, String name, String studyId,
	    String owners, Set individuals) {
	this.studyOid = studyOid;
	this.taxon = taxon;
	this.site = site;
	this.name = name;
	this.studyId = studyId;
	this.owners = owners;
	this.individuals = individuals;
    }

    public int getStudyOid() {
	return this.studyOid;
    }

    public void setStudyOid(int studyOid) {
	this.studyOid = studyOid;
    }

    public Taxon getTaxon() {
	return this.taxon;
    }

    public void setTaxon(Taxon taxon) {
	this.taxon = taxon;
    }

    public Site getSite() {
	return this.site;
    }

    public void setSite(Site site) {
	this.site = site;
    }

    public String getName() {
	return this.name;
    }

    public void setName(String name) {
	this.name = name;
    }

    public String getStudyId() {
	return this.studyId;
    }

    public void setStudyId(String studyId) {
	this.studyId = studyId;
    }

    public String getOwners() {
	return this.owners;
    }

    public void setOwners(String owners) {
	this.owners = owners;
    }

    public Set getIndividuals() {
	return this.individuals;
    }

    public void setIndividuals(Set individuals) {
	this.individuals = individuals;
    }

}
