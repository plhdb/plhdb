package org.nescent.plhdb.spring;

import java.util.Iterator;
import java.util.List;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.hibernate.HibernateException;
import org.hibernate.Query;
import org.hibernate.Session;
import org.nescent.plhdb.hibernate.HibernateSessionFactory;
import org.nescent.plhdb.hibernate.dao.Permission;
import org.nescent.plhdb.hibernate.dao.UserAccount;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.Controller;

public class DeleteUserController implements Controller {
	private static Logger log;

	private static Logger log() {
		if (log == null) {
			log = Logger.getLogger(DeleteUserController.class);
		}
		return log;
	}

	@SuppressWarnings("unchecked")
	public ModelAndView handleRequest(HttpServletRequest request,
			HttpServletResponse response) {

		String id = nullIfEmpty(request.getParameter("id"));
		if (id == null) {
			throw new IllegalArgumentException("No user id specified.");
		}
		Session session = HibernateSessionFactory.getSession();
		try {
			UserAccount ua = (UserAccount) session.get(
					"org.nescent.plhdb.hibernate.dao.UserAccount", Integer
							.parseInt(id));

			if (ua == null) {
				throw new IllegalArgumentException(
						"failed to retrieve the user account with id: " + id);
			}

			Set perms = ua.getPermissions();
			for (Iterator it = perms.iterator(); it.hasNext();) {
				Permission p = (Permission) it.next();
				session.delete(p);
			}
			ua.getPermissions().clear();
			session.delete(ua);
			session.flush();
			String sql = "FROM UserAccount ORDER BY lastName";
			Query q = session.createQuery(sql);
			List users = q.list();
			return new ModelAndView("users", "users", users);
		} catch (HibernateException he) {
			log().error("failed to retrive the user.", he);
			throw he;
		} 
	}

	private String nullIfEmpty(String s) {
		return (s != null && s.trim().equals("")) ? null : s;
	}

}
