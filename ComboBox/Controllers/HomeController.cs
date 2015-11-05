using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Reflection;

namespace ComboBox.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Test()
        {
            var oo = new { a = 1, b = 2, c = 3 };
            var o1 = new { a = 1, b = 2, d = 3 };
            //oo.GetType().GetProperties(BindingFlags.Instance | BindingFlags.Public);
            //var type = oo.GetType();
            return View(new List<dynamic>() { oo, o1 });
        }

        public ActionResult ComboBox()
        {
            return View();
        }
    }
}
